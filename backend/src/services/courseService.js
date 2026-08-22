const prisma = require('../config/db');
const { ROLES } = require('../constants/roles');
const ApiError = require('../utils/apiError');

class CourseService {
  /**
   * List courses based on user role and query filters
   */
  async getCourses(user, query = {}) {
    const { search, facultyId } = query;

    const where = {};

    // 1. Role-based scoping
    if (user.role === ROLES.FACULTY) {
      // Faculty ONLY see courses assigned to them
      where.facultyId = user.id;
    } else if (user.role === ROLES.ADMIN || user.role === ROLES.STUDENT) {
      // Admins and Students can see all courses, with optional faculty filter
      if (facultyId) {
        where.facultyId = facultyId;
      }
    }

    // 2. Search filter (title, course code, or description)
    if (search && search.trim() !== '') {
      const searchTerm = search.trim();
      where.OR = [
        { title: { contains: searchTerm, mode: 'insensitive' } },
        { courseCode: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    const courses = await prisma.course.findMany({
      where,
      include: {
        faculty: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return courses;
  }

  /**
   * Get single course details with RBAC check
   */
  async getCourseById(courseId, user) {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        faculty: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!course) {
      throw ApiError.notFound(`Course with ID '${courseId}' was not found.`);
    }

    // Role-based access validation
    if (user.role === ROLES.FACULTY && course.facultyId !== user.id) {
      throw ApiError.forbidden(
        'Access denied: You are only authorized to view courses assigned to you.'
      );
    }

    return course;
  }

  /**
   * Create a new course
   */
  async createCourse(courseData, user) {
    if (user.role === ROLES.STUDENT) {
      throw ApiError.forbidden('Students do not have permission to create courses.');
    }

    const { title, courseCode, description, duration } = courseData;
    let targetFacultyId = null;

    if (user.role === ROLES.FACULTY) {
      // Faculty must create course assigned to themselves
      targetFacultyId = user.id;
    } else if (user.role === ROLES.ADMIN) {
      // Admin must assign to a valid faculty member
      if (!courseData.facultyId) {
        throw ApiError.badRequest('A course must be assigned to a valid Faculty member.');
      }
      targetFacultyId = courseData.facultyId;

      // Verify the target faculty user exists and has FACULTY role
      const facultyUser = await prisma.user.findUnique({
        where: { id: targetFacultyId },
      });

      if (!facultyUser || facultyUser.role !== ROLES.FACULTY) {
        throw ApiError.badRequest('Assigned user must be an active Faculty member.');
      }
    }

    // Check duplicate courseCode
    const existingCourse = await prisma.course.findUnique({
      where: { courseCode: courseCode.toUpperCase() },
    });

    if (existingCourse) {
      throw ApiError.conflict(
        `A course with code '${courseCode.toUpperCase()}' already exists.`
      );
    }

    const newCourse = await prisma.course.create({
      data: {
        title,
        courseCode: courseCode.toUpperCase(),
        description,
        duration,
        facultyId: targetFacultyId,
        createdById: user.id,
      },
      include: {
        faculty: {
          select: { id: true, name: true, email: true },
        },
        createdBy: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });

    return newCourse;
  }

  /**
   * Update an existing course
   */
  async updateCourse(courseId, updateData, user) {
    if (user.role === ROLES.STUDENT) {
      throw ApiError.forbidden('Students do not have permission to update courses.');
    }

    const existingCourse = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!existingCourse) {
      throw ApiError.notFound(`Course with ID '${courseId}' was not found.`);
    }

    // Check ownership for Faculty
    if (user.role === ROLES.FACULTY && existingCourse.facultyId !== user.id) {
      throw ApiError.forbidden(
        'You are not authorized to update courses assigned to another faculty member.'
      );
    }

    const dataToUpdate = {};

    if (updateData.title !== undefined) dataToUpdate.title = updateData.title;
    if (updateData.description !== undefined)
      dataToUpdate.description = updateData.description;
    if (updateData.duration !== undefined) dataToUpdate.duration = updateData.duration;

    // Check courseCode uniqueness if modified
    if (
      updateData.courseCode &&
      updateData.courseCode.toUpperCase() !== existingCourse.courseCode
    ) {
      const codeExists = await prisma.course.findUnique({
        where: { courseCode: updateData.courseCode.toUpperCase() },
      });
      if (codeExists) {
        throw ApiError.conflict(
          `Course code '${updateData.courseCode.toUpperCase()}' is already in use.`
        );
      }
      dataToUpdate.courseCode = updateData.courseCode.toUpperCase();
    }

    // Handle faculty reassignment (Admins only)
    if (updateData.facultyId) {
      if (user.role !== ROLES.ADMIN) {
        throw ApiError.forbidden('Only Administrators can reassign course faculty.');
      }
      const facultyUser = await prisma.user.findUnique({
        where: { id: updateData.facultyId },
      });
      if (!facultyUser || facultyUser.role !== ROLES.FACULTY) {
        throw ApiError.badRequest('Assigned user must be an active Faculty member.');
      }
      dataToUpdate.facultyId = updateData.facultyId;
    }

    const updatedCourse = await prisma.course.update({
      where: { id: courseId },
      data: dataToUpdate,
      include: {
        faculty: {
          select: { id: true, name: true, email: true },
        },
        createdBy: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });

    return updatedCourse;
  }

  /**
   * Delete a course
   */
  async deleteCourse(courseId, user) {
    if (user.role === ROLES.STUDENT) {
      throw ApiError.forbidden('Students do not have permission to delete courses.');
    }

    const existingCourse = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!existingCourse) {
      throw ApiError.notFound(`Course with ID '${courseId}' was not found.`);
    }

    // Check ownership for Faculty
    if (user.role === ROLES.FACULTY && existingCourse.facultyId !== user.id) {
      throw ApiError.forbidden(
        'You are not authorized to delete courses assigned to another faculty member.'
      );
    }

    await prisma.course.delete({
      where: { id: courseId },
    });

    return { id: courseId, title: existingCourse.title };
  }
}

module.exports = new CourseService();

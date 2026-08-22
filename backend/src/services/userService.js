const prisma = require('../config/db');
const { ROLES } = require('../constants/roles');

class UserService {
  /**
   * Get all users with FACULTY role (for course assignment dropdowns)
   */
  async getFacultyList() {
    const faculty = await prisma.user.findMany({
      where: { role: ROLES.FACULTY },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: { name: 'asc' },
    });

    return faculty;
  }

  /**
   * Get dashboard analytics and counts tailored to caller's role
   */
  async getDashboardStats(user) {
    if (user.role === ROLES.ADMIN) {
      const [totalCourses, totalFaculty, totalStudents, recentCourses] =
        await Promise.all([
          prisma.course.count(),
          prisma.user.count({ where: { role: ROLES.FACULTY } }),
          prisma.user.count({ where: { role: ROLES.STUDENT } }),
          prisma.course.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: {
              faculty: { select: { id: true, name: true, email: true } },
              createdBy: { select: { id: true, name: true, role: true } },
            },
          }),
        ]);

      return {
        role: ROLES.ADMIN,
        totalCourses,
        totalFaculty,
        totalStudents,
        recentCourses,
      };
    }

    if (user.role === ROLES.FACULTY) {
      const [assignedCoursesCount, totalCourses, recentCourses] =
        await Promise.all([
          prisma.course.count({ where: { facultyId: user.id } }),
          prisma.course.count(),
          prisma.course.findMany({
            where: { facultyId: user.id },
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: {
              faculty: { select: { id: true, name: true, email: true } },
              createdBy: { select: { id: true, name: true, role: true } },
            },
          }),
        ]);

      return {
        role: ROLES.FACULTY,
        assignedCoursesCount,
        totalCourses,
        recentCourses,
      };
    }

    // Student role
    const [totalCourses, recentCourses] = await Promise.all([
      prisma.course.count(),
      prisma.course.findMany({
        take: 6,
        orderBy: { createdAt: 'desc' },
        include: {
          faculty: { select: { id: true, name: true, email: true } },
        },
      }),
    ]);

    return {
      role: ROLES.STUDENT,
      totalCourses,
      recentCourses,
    };
  }
}

module.exports = new UserService();

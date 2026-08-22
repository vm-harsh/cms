const prisma = require('../config/db');
const { ROLES } = require('../constants/roles');
const ApiError = require('../utils/apiError');

/**
 * Restrict endpoint access to specific roles
 * @param  {...string} allowedRoles
 */
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(
          `Access forbidden: Role '${req.user.role}' is not authorized to access this resource`
        )
      );
    }

    next();
  };
}

/**
 * Middleware ensuring that only Admin or the assigned Faculty can modify/delete a specific course
 */
async function requireCourseOwnership(req, res, next) {
  try {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required'));
    }

    const { id } = req.params;
    if (!id) {
      return next(ApiError.badRequest('Course ID is required'));
    }

    // Students can NEVER modify or delete courses
    if (req.user.role === ROLES.STUDENT) {
      return next(
        ApiError.forbidden('Students do not have permission to modify or delete courses')
      );
    }

    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        faculty: {
          select: { id: true, name: true, email: true },
        },
        createdBy: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });

    if (!course) {
      return next(ApiError.notFound(`Course with ID '${id}' was not found`));
    }

    // Admins have full access to any course
    if (req.user.role === ROLES.ADMIN) {
      req.course = course;
      return next();
    }

    // Faculty can ONLY modify courses assigned to themselves
    if (req.user.role === ROLES.FACULTY) {
      if (course.facultyId !== req.user.id) {
        return next(
          ApiError.forbidden(
            'You are not authorized to modify or delete courses assigned to another faculty member'
          )
        );
      }
      req.course = course;
      return next();
    }

    return next(ApiError.forbidden('Unauthorized access'));
  } catch (error) {
    next(error);
  }
}

module.exports = {
  requireRole,
  requireCourseOwnership,
};

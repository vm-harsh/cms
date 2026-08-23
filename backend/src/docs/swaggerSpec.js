const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'EduCore - Course Management System API',
    version: '1.0.0',
    description: `
**EduCore RESTful API Documentation**

Production-quality Course Management System with strict multi-role Role-Based Access Control (RBAC).

### User Roles:
- **ADMIN**: Full institutional CRUD on all courses, assignment of faculty, and provisioning of Admin & Faculty accounts.
- **FACULTY**: Management and curriculum updates strictly limited to their own assigned courses.
- **STUDENT**: Read-only access to browse course catalog and view syllabi.

### Authentication:
Authentication is managed via signed JWTs stored in secure **HTTP-Only Cookies** (\`cms_token\`) or provided via the \`Authorization: Bearer <token>\` header.
    `,
    contact: {
      name: 'EduCore Engineering Team',
      email: 'support@educore.institution.edu',
    },
  },
  servers: [
    {
      url: '/api',
      description: 'API Base URL',
    },
  ],
  tags: [
    { name: 'Authentication', description: 'User login, registration, profile retrieval, and session logout' },
    { name: 'Courses', description: 'Course catalog, syllabus management, creation, updates, and deletion' },
    { name: 'Admin Management', description: 'Administrator-only account provisioning for Admins, Faculty, and Students' },
    { name: 'Users & Analytics', description: 'Role-tailored dashboard analytics and faculty directory' },
    { name: 'System', description: 'Health and status endpoints' },
  ],
  paths: {
    '/health': {
      get: {
        tags: ['System'],
        summary: 'Service Health Check',
        description: 'Returns API operational status and current server timestamp.',
        responses: {
          200: {
            description: 'API service is healthy and responding',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'healthy' },
                    timestamp: { type: 'string', example: '2026-08-23T09:00:00.000Z' },
                    service: { type: 'string', example: 'Course Management System API' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/auth/register': {
      post: {
        tags: ['Authentication'],
        summary: 'Register Student Account',
        description: 'Open public registration for learner accounts. Always creates a user with role **STUDENT**.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RegisterRequest' },
            },
          },
        },
        responses: {
          201: {
            description: 'Student account registered successfully',
            headers: {
              'Set-Cookie': {
                description: 'HTTP-only session cookie (cms_token)',
                schema: { type: 'string' },
              },
            },
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'User registered successfully' },
                    data: {
                      type: 'object',
                      properties: {
                        user: { $ref: '#/components/schemas/User' },
                        token: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
          400: { $ref: '#/components/responses/ValidationError' },
          409: { $ref: '#/components/responses/ConflictError' },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'User Login',
        description: 'Authenticates credentials and sets secure HTTP-only session cookie.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Login successful',
            headers: {
              'Set-Cookie': {
                description: 'HTTP-only session cookie (cms_token)',
                schema: { type: 'string' },
              },
            },
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Login successful' },
                    data: {
                      type: 'object',
                      properties: {
                        user: { $ref: '#/components/schemas/User' },
                        token: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/UnauthorizedError' },
        },
      },
    },
    '/auth/logout': {
      post: {
        tags: ['Authentication'],
        summary: 'User Logout',
        description: 'Clears the authenticated HTTP-only session cookie.',
        responses: {
          200: {
            description: 'Logged out successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Logged out successfully' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Authentication'],
        summary: 'Get Current Authenticated User',
        description: 'Returns profile information of the currently authenticated user.',
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        responses: {
          200: {
            description: 'Current session user profile',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        user: { $ref: '#/components/schemas/User' },
                      },
                    },
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/UnauthorizedError' },
        },
      },
    },
    '/courses': {
      get: {
        tags: ['Courses'],
        summary: 'List Courses',
        description: 'Retrieve courses with optional search and instructor filter. Admins & Students view all active courses; Faculty view only assigned courses.',
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        parameters: [
          {
            name: 'search',
            in: 'query',
            description: 'Keyword search for title or course code',
            required: false,
            schema: { type: 'string' },
          },
          {
            name: 'facultyId',
            in: 'query',
            description: 'Filter courses by assigned faculty ID',
            required: false,
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: {
            description: 'List of courses retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        courses: {
                          type: 'array',
                          items: { $ref: '#/components/schemas/Course' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/UnauthorizedError' },
        },
      },
      post: {
        tags: ['Courses'],
        summary: 'Create Course',
        description: 'Creates a new curriculum course. Admins can assign to any Faculty; Faculty automatically self-assigns.',
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateCourseRequest' },
            },
          },
        },
        responses: {
          201: {
            description: 'Course created successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Course created successfully' },
                    data: {
                      type: 'object',
                      properties: {
                        course: { $ref: '#/components/schemas/Course' },
                      },
                    },
                  },
                },
              },
            },
          },
          400: { $ref: '#/components/responses/ValidationError' },
          401: { $ref: '#/components/responses/UnauthorizedError' },
          403: { $ref: '#/components/responses/ForbiddenError' },
          409: { $ref: '#/components/responses/ConflictError' },
        },
      },
    },
    '/courses/{id}': {
      get: {
        tags: ['Courses'],
        summary: 'Get Course Details',
        description: 'Retrieve detailed information and syllabus for a specific course by ID.',
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'Course ID',
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: {
            description: 'Course details retrieved',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        course: { $ref: '#/components/schemas/Course' },
                      },
                    },
                  },
                },
              },
            },
          },
          404: { $ref: '#/components/responses/NotFoundError' },
        },
      },
      patch: {
        tags: ['Courses'],
        summary: 'Update Course',
        description: 'Update course details. Only ADMIN or the assigned FACULTY owner can modify the course.',
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'Course ID',
            schema: { type: 'string' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateCourseRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Course updated successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Course updated successfully' },
                    data: {
                      type: 'object',
                      properties: {
                        course: { $ref: '#/components/schemas/Course' },
                      },
                    },
                  },
                },
              },
            },
          },
          400: { $ref: '#/components/responses/ValidationError' },
          403: { $ref: '#/components/responses/ForbiddenError' },
          404: { $ref: '#/components/responses/NotFoundError' },
          409: { $ref: '#/components/responses/ConflictError' },
        },
      },
      delete: {
        tags: ['Courses'],
        summary: 'Delete Course',
        description: 'Permanently remove a course. Only ADMIN or the assigned FACULTY owner can delete.',
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'Course ID',
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: {
            description: 'Course deleted successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Course deleted successfully' },
                  },
                },
              },
            },
          },
          403: { $ref: '#/components/responses/ForbiddenError' },
          404: { $ref: '#/components/responses/NotFoundError' },
        },
      },
    },
    '/admin/admins': {
      get: {
        tags: ['Admin Management'],
        summary: 'List Administrators',
        description: 'Lists all system administrators (ADMIN role only).',
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        responses: {
          200: {
            description: 'Administrators list retrieved',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        admins: {
                          type: 'array',
                          items: { $ref: '#/components/schemas/UserWithCount' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          403: { $ref: '#/components/responses/ForbiddenError' },
        },
      },
      post: {
        tags: ['Admin Management'],
        summary: 'Create Administrator',
        description: 'Provisions a new Administrator account (ADMIN role only).',
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateAdminFacultyRequest' },
            },
          },
        },
        responses: {
          201: {
            description: 'Administrator account provisioned',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Administrator created successfully' },
                    data: {
                      type: 'object',
                      properties: {
                        user: { $ref: '#/components/schemas/User' },
                      },
                    },
                  },
                },
              },
            },
          },
          400: { $ref: '#/components/responses/ValidationError' },
          403: { $ref: '#/components/responses/ForbiddenError' },
          409: { $ref: '#/components/responses/ConflictError' },
        },
      },
    },
    '/admin/faculty': {
      get: {
        tags: ['Admin Management'],
        summary: 'List Faculty Members',
        description: 'Lists all faculty instructors with assigned course counts (ADMIN role only).',
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        responses: {
          200: {
            description: 'Faculty list retrieved',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        faculty: {
                          type: 'array',
                          items: { $ref: '#/components/schemas/UserWithCount' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          403: { $ref: '#/components/responses/ForbiddenError' },
        },
      },
      post: {
        tags: ['Admin Management'],
        summary: 'Create Faculty Member',
        description: 'Provisions a new Faculty instructor account (ADMIN role only).',
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateAdminFacultyRequest' },
            },
          },
        },
        responses: {
          201: {
            description: 'Faculty account provisioned',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Faculty member created successfully' },
                    data: {
                      type: 'object',
                      properties: {
                        user: { $ref: '#/components/schemas/User' },
                      },
                    },
                  },
                },
              },
            },
          },
          400: { $ref: '#/components/responses/ValidationError' },
          403: { $ref: '#/components/responses/ForbiddenError' },
          409: { $ref: '#/components/responses/ConflictError' },
        },
      },
    },
    '/admin/students': {
      get: {
        tags: ['Admin Management'],
        summary: 'List Students',
        description: 'Lists all registered student learners (ADMIN role only).',
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        responses: {
          200: {
            description: 'Student directory retrieved',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        students: {
                          type: 'array',
                          items: { $ref: '#/components/schemas/User' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          403: { $ref: '#/components/responses/ForbiddenError' },
        },
      },
    },
    '/users/faculty': {
      get: {
        tags: ['Users & Analytics'],
        summary: 'List Faculty for Dropdowns',
        description: 'Retrieve list of faculty members for course assignment dropdowns (ADMIN and FACULTY roles).',
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        responses: {
          200: {
            description: 'Faculty list retrieved',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        faculty: {
                          type: 'array',
                          items: { $ref: '#/components/schemas/User' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          403: { $ref: '#/components/responses/ForbiddenError' },
        },
      },
    },
    '/users/stats': {
      get: {
        tags: ['Users & Analytics'],
        summary: 'Dashboard Metrics & Statistics',
        description: 'Fetches customized analytics and recent courses based on caller role.',
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        responses: {
          200: {
            description: 'Dashboard statistics retrieved',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        stats: { type: 'object' },
                      },
                    },
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/UnauthorizedError' },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'cms_token',
        description: 'HTTP-only session cookie containing signed JWT token',
      },
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Standard Authorization header with Bearer JWT token',
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'cuid_user_12345' },
          name: { type: 'string', example: 'Dr. Sarah Smith' },
          email: { type: 'string', format: 'email', example: 'dr.smith@institution.edu' },
          role: { type: 'string', enum: ['ADMIN', 'FACULTY', 'STUDENT'], example: 'FACULTY' },
          createdAt: { type: 'string', format: 'date-time', example: '2026-08-23T10:00:00.000Z' },
          updatedAt: { type: 'string', format: 'date-time', example: '2026-08-23T10:00:00.000Z' },
        },
      },
      UserWithCount: {
        allOf: [
          { $ref: '#/components/schemas/User' },
          {
            type: 'object',
            properties: {
              _count: {
                type: 'object',
                properties: {
                  assignedCourses: { type: 'integer', example: 3 },
                  createdCourses: { type: 'integer', example: 5 },
                },
              },
            },
          },
        ],
      },
      Course: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'cuid_course_67890' },
          title: { type: 'string', example: 'Data Structures and Algorithms' },
          courseCode: { type: 'string', example: 'CS201' },
          description: { type: 'string', example: 'Rigorous analysis of trees, graphs, heaps, hash tables, and asymptotic time complexity.' },
          duration: { type: 'string', example: '14 Weeks (56 Hours)' },
          facultyId: { type: 'string', example: 'cuid_user_12345' },
          createdById: { type: 'string', example: 'cuid_user_12345' },
          createdAt: { type: 'string', format: 'date-time', example: '2026-08-23T10:00:00.000Z' },
          updatedAt: { type: 'string', format: 'date-time', example: '2026-08-23T10:00:00.000Z' },
          faculty: { $ref: '#/components/schemas/User' },
          createdBy: { $ref: '#/components/schemas/User' },
        },
      },
      RegisterRequest: {
        type: 'object',
        required: ['name', 'email', 'password'],
        properties: {
          name: { type: 'string', minLength: 2, maxLength: 100, example: 'Eleanor Vance' },
          email: { type: 'string', format: 'email', example: 'eleanor@institution.edu' },
          password: { type: 'string', minLength: 6, maxLength: 100, example: 'Password123!' },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'admin@institution.edu' },
          password: { type: 'string', example: 'Password123!' },
        },
      },
      CreateAdminFacultyRequest: {
        type: 'object',
        required: ['name', 'email', 'password'],
        properties: {
          name: { type: 'string', minLength: 2, maxLength: 100, example: 'Dr. Alan Turing' },
          email: { type: 'string', format: 'email', example: 'alan.turing@institution.edu' },
          password: { type: 'string', minLength: 6, maxLength: 100, example: 'TemporaryPassword123!' },
        },
      },
      CreateCourseRequest: {
        type: 'object',
        required: ['title', 'courseCode', 'description', 'duration'],
        properties: {
          title: { type: 'string', minLength: 3, maxLength: 150, example: 'Operating Systems' },
          courseCode: { type: 'string', minLength: 2, maxLength: 20, example: 'CS302' },
          description: { type: 'string', minLength: 10, maxLength: 2000, example: 'Concurrency, memory management, file systems, and kernel architecture.' },
          duration: { type: 'string', minLength: 2, maxLength: 50, example: '12 Weeks' },
          facultyId: { type: 'string', description: 'Assigned instructor ID (Required for Admins, optional for Faculty)', example: 'cuid_user_12345' },
        },
      },
      UpdateCourseRequest: {
        type: 'object',
        properties: {
          title: { type: 'string', minLength: 3, maxLength: 150, example: 'Advanced Operating Systems' },
          courseCode: { type: 'string', minLength: 2, maxLength: 20, example: 'CS302' },
          description: { type: 'string', minLength: 10, maxLength: 2000, example: 'Updated curriculum syllabus content.' },
          duration: { type: 'string', minLength: 2, maxLength: 50, example: '14 Weeks' },
          facultyId: { type: 'string', description: 'Reassign faculty instructor (Admin only)', example: 'cuid_user_12345' },
        },
      },
    },
    responses: {
      ValidationError: {
        description: 'Validation Error (Zod request validation failed)',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: false },
                message: { type: 'string', example: 'Validation Error: Name must be at least 2 characters long' },
                errors: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      field: { type: 'string', example: 'name' },
                      message: { type: 'string', example: 'Name must be at least 2 characters long' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      UnauthorizedError: {
        description: 'Unauthorized (Missing or invalid authentication token)',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: false },
                message: { type: 'string', example: 'Authentication required. Please log in to continue.' },
              },
            },
          },
        },
      },
      ForbiddenError: {
        description: 'Forbidden (User lacks necessary role or resource ownership)',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: false },
                message: { type: 'string', example: 'Forbidden: You do not have permission to perform this action' },
              },
            },
          },
        },
      },
      NotFoundError: {
        description: 'Resource Not Found',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: false },
                message: { type: 'string', example: 'Requested record was not found in the database.' },
              },
            },
          },
        },
      },
      ConflictError: {
        description: 'Conflict (Unique constraint violation: duplicate email or courseCode)',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: false },
                message: { type: 'string', example: 'A course with course code CS201 already exists.' },
              },
            },
          },
        },
      },
    },
  },
};

module.exports = swaggerSpec;

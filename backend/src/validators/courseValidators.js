const { z } = require('zod');

const createCourseSchema = z.object({
  body: z.object({
    title: z
      .string({ required_error: 'Course title is required' })
      .trim()
      .min(3, 'Title must be at least 3 characters long')
      .max(150, 'Title cannot exceed 150 characters'),
    courseCode: z
      .string({ required_error: 'Course code is required' })
      .trim()
      .min(2, 'Course code must be at least 2 characters')
      .max(20, 'Course code cannot exceed 20 characters')
      .transform((val) => val.toUpperCase()),
    description: z
      .string({ required_error: 'Course description is required' })
      .trim()
      .min(10, 'Description must be at least 10 characters long')
      .max(2000, 'Description cannot exceed 2000 characters'),
    duration: z
      .string({ required_error: 'Course duration is required' })
      .trim()
      .min(2, 'Duration must be at least 2 characters long')
      .max(50, 'Duration cannot exceed 50 characters'),
    facultyId: z
      .string()
      .trim()
      .min(1, 'Faculty ID cannot be empty')
      .optional(),
  }),
});

const updateCourseSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Course ID is required'),
  }),
  body: z
    .object({
      title: z
        .string()
        .trim()
        .min(3, 'Title must be at least 3 characters long')
        .max(150, 'Title cannot exceed 150 characters')
        .optional(),
      courseCode: z
        .string()
        .trim()
        .min(2, 'Course code must be at least 2 characters')
        .max(20, 'Course code cannot exceed 20 characters')
        .transform((val) => val.toUpperCase())
        .optional(),
      description: z
        .string()
        .trim()
        .min(10, 'Description must be at least 10 characters long')
        .max(2000, 'Description cannot exceed 2000 characters')
        .optional(),
      duration: z
        .string()
        .trim()
        .min(2, 'Duration must be at least 2 characters long')
        .max(50, 'Duration cannot exceed 50 characters')
        .optional(),
      facultyId: z
        .string()
        .trim()
        .min(1, 'Faculty ID cannot be empty')
        .optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field must be provided for update',
    }),
});

const courseIdParamSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Course ID is required in URL parameters'),
  }),
});

const queryCoursesSchema = z.object({
  query: z
    .object({
      search: z.string().trim().optional(),
      facultyId: z.string().trim().optional(),
      page: z.string().optional(),
      limit: z.string().optional(),
    })
    .optional(),
});

module.exports = {
  createCourseSchema,
  updateCourseSchema,
  courseIdParamSchema,
  queryCoursesSchema,
};

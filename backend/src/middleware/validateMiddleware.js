const { ZodError } = require('zod');
const ApiError = require('../utils/apiError');

/**
 * Higher-order middleware function to validate request against Zod schema
 * @param {import('zod').ZodSchema} schema
 */
function validate(schema) {
  return async (req, res, next) => {
    try {
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      // Assign parsed & sanitized values back to request
      if (parsed.body !== undefined) req.body = parsed.body;
      if (parsed.query !== undefined) req.query = parsed.query;
      if (parsed.params !== undefined) req.params = parsed.params;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map((err) => ({
          field: err.path.slice(1).join('.'),
          message: err.message,
        }));
        
        const firstMessage = errorMessages[0]?.message || 'Validation failed';
        return next(new ApiError(400, firstMessage, errorMessages));
      }
      next(error);
    }
  };
}

module.exports = validate;

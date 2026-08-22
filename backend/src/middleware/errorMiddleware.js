const config = require('../config/env');
const ApiError = require('../utils/apiError');

/**
 * 404 Not Found Middleware for unhandled routes
 */
function notFoundHandler(req, res, next) {
  next(new ApiError(404, `Route ${req.method} ${req.originalUrl} not found`));
}

/**
 * Centralized Global Error Handler
 */
function errorHandler(err, req, res, next) {
  let error = err;

  // 1. Convert Prisma known errors to ApiError
  if (err.code === 'P2002') {
    const target = err.meta?.target ? err.meta.target.join(', ') : 'field';
    error = ApiError.conflict(`A record with this ${target} already exists.`);
  } else if (err.code === 'P2025') {
    error = ApiError.notFound('Requested record was not found in the database.');
  } else if (err.code === 'P2003') {
    error = ApiError.badRequest('Referenced entity does not exist (Foreign Key Constraint Failed).');
  }

  // 2. Convert JWT Errors
  else if (err.name === 'JsonWebTokenError') {
    error = ApiError.unauthorized('Invalid authentication token.');
  } else if (err.name === 'TokenExpiredError') {
    error = ApiError.unauthorized('Authentication token has expired.');
  }

  // 3. Convert JSON syntax errors
  else if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    error = ApiError.badRequest('Malformed JSON payload received in request body.');
  }

  // 4. Fallback if not an instance of ApiError
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';
    error = new ApiError(statusCode, message, [], false);
  }

  // 5. Structure error response
  const response = {
    success: false,
    message: error.message,
    ...(error.errors && error.errors.length > 0 ? { errors: error.errors } : {}),
    ...(config.nodeEnv === 'development' && !error.isOperational ? { stack: err.stack } : {}),
  };

  if (config.nodeEnv === 'development' && error.statusCode >= 500) {
    console.error('🔥 [Unhandled Error]:', err);
  }

  res.status(error.statusCode).json(response);
}

module.exports = {
  notFoundHandler,
  errorHandler,
};

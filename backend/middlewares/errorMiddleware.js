/**
 * Global Error Handler Middleware
 * Handles all errors thrown across the application and returns consistent error responses
 */

export const errorHandler = (err, req, res, next) => {
  // Set default error status and message
  let status = err.status || 500;
  let message = err.message || "Internal Server Error";

  // Mongoose Validation Error
  if (err.name === "ValidationError") {
    status = 400;
    const messages = Object.values(err.errors).map(e => e.message);
    message = messages.join(", ");
  }

  // Mongoose Cast Error (Invalid ObjectId)
  if (err.name === "CastError") {
    status = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // Mongoose Duplicate Key Error
  if (err.code === 11000) {
    status = 400;
    const field = Object.keys(err.keyPattern)[0];
    message = `${field} already exists`;
  }

  // JWT Errors
  if (err.name === "JsonWebTokenError") {
    status = 401;
    message = "Invalid token";
  }

  if (err.name === "TokenExpiredError") {
    status = 401;
    message = "Token expired";
  }

  // Return error response
  res.status(status).json({
    success: false,
    error: {
      status,
      message,
      ...(process.env.NODE_ENV === "development" && { stack: err.stack })
    }
  });
};

/**
 * Async Error Wrapper
 * Wraps async route handlers to catch errors and pass them to error middleware
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

/**
 * 404 Not Found Middleware
 * Should be used after all route definitions
 */
export const notFoundHandler = (req, res) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    error: {
      status: 404,
      message: "Route not found"
    }
  });
};


// Global Centralized Error Handling Middleware

import { ApiError } from "../utils/ApiError.js";

// errorHandler
//  Catches all errors forwarded by next(error) from asyncHandler

const errorHandler = (err, req, res, next) => {
  let error = err;

  // If the error is not an instance of our custom ApiError, convert it
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 500;
    const message = error.message || "Internal Server Error";
    error = new ApiError(statusCode, message, error?.errors || [], err.stack);
  }

  // Build standardized JSON error response
  const response = {
    statusCode: error.statusCode,
    message: error.message,
    success: false,
    errors: error.errors,
    // Only show stack trace in development mode
    ...(process.env.NODE_ENV === "development" ? { stack: error.stack } : {}),
  };

  return res.status(error.statusCode).json(response);
};

// notFoundHandler
// Catches any request made to an undefined route (404)

const notFoundHandler = (req, res, next) => {
  const error = new ApiError(404, `Not Found - ${req.originalUrl}`);
  next(error);
};

export { errorHandler, notFoundHandler };
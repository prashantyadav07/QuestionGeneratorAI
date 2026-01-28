/**
 * Custom error handling middleware for Express
 */

/**
 * 404 Not Found Handler
 */
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.path}`,
    timestamp: new Date().toISOString()
  });
};

/**
 * Global error handler middleware
 * Must be the last middleware registered
 */
export const errorHandler = (err, req, res, next) => {
  console.error('❌ Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  // Handle specific error types
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format.'
    });
  }

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      success: false,
      message: 'Validation error.',
      details: messages
    });
  }

  if (err.name === 'MongoError' || err.name === 'MongoServerError') {
    return res.status(500).json({
      success: false,
      message: 'Database error.'
    });
  }

  // Handle multer file upload errors
  if (err.code === 'FILE_TOO_LARGE' || err.message?.includes('File too large')) {
    return res.status(413).json({
      success: false,
      message: 'File too large. Maximum size is 50MB.'
    });
  }

  if (err.message?.includes('Only PDF files')) {
    return res.status(400).json({
      success: false,
      message: 'Only PDF files are allowed.'
    });
  }

  // Default error response
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'An internal server error occurred.';

  res.status(statusCode).json({
    success: false,
    message: statusCode === 500 ? 'Internal server error.' : message,
    error: process.env.NODE_ENV === 'development' ? message : undefined,
    timestamp: new Date().toISOString()
  });
};

/**
 * Async error wrapper for route handlers
 * Usage: router.post('/route', asyncHandler(controller))
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

function errorHandler(err, req, res, next) {
  // Log the full error stack for debugging
  console.error('Error occurred:', err);

  // Default to 500 (Internal Server Error) if no status is provided
  // 400 is for Bad Request, which might not be appropriate for all errors
  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || 'Something went wrong';

  // Add more context in development mode
  const response = {
    error: message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  };

  console.error(`Error: ${statusCode} - ${message}`);
  
  res.status(statusCode).json(response);
};

module.exports = { errorHandler }
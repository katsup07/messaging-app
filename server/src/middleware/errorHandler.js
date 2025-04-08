function errorHandler(err, req, res, next) {
  // Log the error with useful information for debugging
  console.error(`[Error] ${err.status || err.statusCode || 500} - ${err.message || 'Unknown error'}`, {
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || 'Something went wrong';

  // Add more context in development mode
  const response = {
    error: message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  };
  
  res.status(statusCode).json(response);
};

module.exports = { errorHandler }
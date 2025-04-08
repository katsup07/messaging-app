/**
 * Creates and throws an error with the specified message and status code
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @throws {Error} - Error with message and status
 */
function throwError(message, statusCode = 500) {
  const error = new Error(message);
  error.status = statusCode;
  throw error;
}

module.exports = { throwError };
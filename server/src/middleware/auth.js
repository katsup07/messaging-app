const { authService } = require('../diContainer');

/**
 * Middleware to check if the user is authenticated
 */
async function authenticate(req, res, next) {
  try {
    const token = extractTokenFromHeaders(req.headers);
    if (!token)
       return res.status(401).json({ isValid: false, error: 'Invalid authorization format' });

    const result = await authService.verifyToken(token);
    if (!result)
      return res.status(401).json({ isValid: false, error: 'Invalid or expired token' });
    
    req.user = { userId: result.userId };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Authentication failed' });
  }
}

function extractTokenFromHeaders(headers) {
  const { authorization } = headers;
  if (!authorization) return null;

  const bearerAndToken = authorization.split(' ');

  if (bearerAndToken.length !== 2 || bearerAndToken[0] !== 'Bearer') return null;
  
  const token = bearerAndToken[1];
  return token;
}

module.exports = { authenticate, extractTokenFromHeaders };
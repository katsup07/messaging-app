const { authService } = require('../diContainer');

/**
 * Middleware to check if the user is authenticated
 */
async function authenticate(req, res, next) {
  try {
    const token = extractTokenFromHeaders(req.headers);
    if (!token)
      return res.status(401).json({ isValid: false, error: 'TokenMissing' });

    const result = await authService.verifyToken(token);
    if (!result || !result.isValid) {
      sendErrorOnInvalidToken(result, res);
      return;
    }

    req.user = { userId: result.userId };
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    if (err.message && err.message.includes('expired'))
      return res.status(401).json({ isValid: false, error: 'TokenExpired' });
    
    return res.status(401).json({ error: 'AuthenticationFailed' });
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

function sendErrorOnInvalidToken(result, res){
  if (result && result.error === 'jwt expired') 
    return res.status(401).json({ isValid: false, error: 'TokenExpired' });
    
  return res.status(401).json({ isValid: false, error: 'InvalidToken' });
}

module.exports = { authenticate, extractTokenFromHeaders };
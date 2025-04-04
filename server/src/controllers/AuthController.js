const { authService } = require('../diContainer');

async function signup(req, res) {

  const { email, password } = req.body;
  try {
    const user = await authService.signup(email, password);
    res.json(user);
  }
  catch (err) {
    if (err.message.includes('Email already in use'))
      return res.status(409).json({ error: err.message });
    
    res.status(500).json({ error: err.message });
  }
}

async function login(req, res) {
  const { email, password } = req.body;
  try {
    const user = await authService.login(email, password);
    res.json(user);
  } catch (err) {
    if (err.message.includes('Invalid credentials'))
      return res.status(401).json({ error: err.message });
    
    res.status(500).json({ error: err.message });
  }
}

async function getUsers(req, res) {
  try {
    const users = await authService.getAllUsers();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function logout(req, res) {
  const { userId } = req.params;
  try {
    await authService.logout(userId);
    res.json({ success: true });
  } catch (err) {
    if (err.message.includes('not found')) 
      return res.status(404).json({ error: err.message });
    
    res.status(500).json({ error: err.message });
  }
}

async function verifyToken(req, res) {
  try {
    const token = extractTokenFromHeaders(req.headers);
    const result = await authService.verifyToken(token);
    if (!result) return res.status(401).json({ isValid: false });

    res.json({ isValid: true, userId: result.userId });
  } catch (err) {
    res.status(401).json({ valid: false });
  }
}

 function extractTokenFromHeaders(headers) {
  const { authorization } = headers;
  if (!authorization)
    return res.status(401).json({ isValid: false, error: 'Missing authorization header' });

  const bearerAndToken = authorization.split(' ');

  if (bearerAndToken.length !== 2 || bearerAndToken[0] !== 'Bearer') 
    return res.status(401).json({ isValid: false, error: 'Invalid authorization format' });
  
  const token = bearerAndToken[1];
  return token;
}

module.exports = { getUsers, login, signup, logout, verifyToken };
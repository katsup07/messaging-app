const { authService } = require('../diContainer');
const { extractTokenFromHeaders } = require('../middleware/auth');

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

async function findUserById(req, res) {
  const { userId } = req.params;
  try {
    const user = await authService.getUserById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function logout(req, res) {
  const { userId } = req.params;
  
  // Authorization check - ensure user can only logout themselves
  if (req.user.userId.toString() !== userId.toString()) {
    return res.status(403).json({ error: 'Unauthorized attempt to logout another user' });
  }
  
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
    if (!result.isValid) return res.status(401).json(result);

    res.json(result);
  } catch (err) {
    res.status(401).json({ valid: false });
  }
}

async function refreshToken(req, res) {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token is required' });
    }
    
    const newTokens = await authService.refreshToken(refreshToken);
    
    if (!newTokens) {
      return res.status(401).json({ error: 'Invalid or expired refresh token' });
    }
    
    res.json(newTokens);
  } catch (err) {
    console.error('Error in refresh token endpoint:', err);
    res.status(500).json({ error: 'Failed to refresh token' });
  }
}

module.exports = { getUsers, login, signup, logout, verifyToken, findUserById, refreshToken };
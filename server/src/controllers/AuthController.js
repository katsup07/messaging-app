const { authService } = require('../diContainer');
const { extractTokenFromHeaders } = require('../middleware/auth');
const { throwError } = require('../utils/throwError');

async function signup(req, res) {
  const { email, password } = req.validatedBody || req.body;
  const user = await authService.signup(email, password);
  res.json(user);
}

async function login(req, res) {
  const { email, password } = req.validatedBody || req.body;
  const user = await authService.login(email, password);
  res.json(user);
}

async function getUsers(req, res) {
  const users = await authService.getAllUsers();
  res.json(users);
}

async function findUserById(req, res) {
  const { userId } = req.params;
  const user = await authService.getUserById(userId);
  if (!user) 
    throwError('User not found', 404);

  res.json(user);
}

async function logout(req, res) {
  const { userId } = req.params;
  
  // Authorization check - ensure user can only logout themselves
  if (req.user.userId.toString() !== userId.toString()) 
    throwError('Unauthorized attempt to logout another user', 403);
  
  await authService.logout(userId);
  res.json({ success: true });
}

async function verifyToken(req, res) {
  const token = extractTokenFromHeaders(req.headers);
  const result = await authService.verifyToken(token);
  if (!result.isValid) {
    return res.status(401).json(result);
  }
  res.json(result);
}

async function refreshToken(req, res) {
  const { refreshToken } = req.validatedBody || req.body;
  
  if (!refreshToken) 
    throwError('Refresh token is required', 400);
  
  const newTokens = await authService.refreshToken(refreshToken);
  
  if (!newTokens) {
    const error = new Error('Invalid or expired refresh token');
    error.status = 401;
    throw error;
  }
  
  res.json(newTokens);
}

module.exports = { getUsers, login, signup, logout, verifyToken, findUserById, refreshToken };
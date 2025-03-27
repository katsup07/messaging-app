const { authService } = require('../diContainer');

async function findUser(req, res) {
  const { email, password } = req.body;
  try {
    const user = await authService.login(email, password);
    res.json(user);
  } catch (err) {
    if (err.message.includes('Invalid credentials')) {
      res.status(401).json({ error: err.message });
    } else {
      res.status(500).json({ error: err.message });
    }
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
    if (err.message.includes('not found')) {
      res.status(404).json({ error: err.message });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
}

module.exports = { getUsers, findUser, logout };
const FileService = require('../services/FileService');

async function findUser(req, res) {
  const { email, password } = req.body;
  try {
    const users = await FileService.getUsers();
    const user = users.find((user) => 
      user.email === email &&
      user.password === password
    );

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Update user's login status
    user.isLoggedIn = true;
    await FileService.saveUsers(users);

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to read user' });
  }
}

async function getUsers(req, res) {
  try {
    const users = await FileService.getUsers();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to read users' });
  }
}

async function logout(req, res) {
  const { userId } = req.params;
  try {
    const users = await FileService.getUsers();
    const user = users.find(u => u.id.toString() === userId);
    
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    user.isLoggedIn = false;
    await FileService.saveUsers(users);
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to logout user' });
  }
}

module.exports = { getUsers, findUser, logout };
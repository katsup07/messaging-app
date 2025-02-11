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

module.exports = { getUsers, findUser };
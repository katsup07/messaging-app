const fs = require('fs').promises;
const path = require('path');

const authFilePath = path.join(__dirname, '../../data/auth.json');

async function findUser(req, res) {
  const { email, password } = req.body;
  console.log('Finding user...', req.body);
  try {
    const data = await fs.readFile(authFilePath, 'utf8');
    const users = JSON.parse(data);
    const user = users.find((user) => 
      user.email === email &&
      user.password === password
    );

    console.log(user);
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
  console.log('Getting users...');

  try {
    const data = await fs.readFile(authFilePath, 'utf8');
    res.json(JSON.parse(data));
  } catch (err) {
    res.status(500).json({ error: 'Failed to read users' });
  }
}

module.exports = { getUsers, findUser };
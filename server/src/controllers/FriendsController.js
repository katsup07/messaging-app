const fs = require('fs').promises;
const path = require('path');

const friendsFile = path.join(__dirname, '../../data/friends.json');

async function getFriends(req, res) {
  console.log('Getting friends in backend...');

  try {
    const data = await fs.readFile(friendsFile, 'utf8');
    const allUsersFriends = JSON.parse(data);
    const userData = allUsersFriends.find((u) => u.user.id.toString() === req.params.userId) || { friends: [] };
    res.json(userData.friends);
  } catch (err) {
    res.status(500).json({ error: 'Failed to read users' });
  }
}

module.exports = { getFriends};
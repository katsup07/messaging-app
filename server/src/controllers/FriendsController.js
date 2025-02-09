const fs = require('fs').promises;
const path = require('path');

const friendsFile = path.join(__dirname, '../../data/friends.json');

async function getFriends(req, res) {
  const { userId } = req.params;
  try {
    const data = await fs.readFile(friendsFile, 'utf8');
    const friends = JSON.parse(data);
    const userFriends = friends.find(f => f.user.id.toString() === userId);
    
    if (!userFriends) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json(userFriends.friends);
  } catch (err) {
    res.status(500).json({ error: 'Failed to read friends' });
  }
}

module.exports = { getFriends};
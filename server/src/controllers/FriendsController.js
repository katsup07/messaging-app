const FileService = require('../services/FileService');

async function getFriends(req, res) {
  const { userId } = req.params;
  try {
    const friends = await FileService.getFriends();
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

module.exports = { getFriends };
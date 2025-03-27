const { friendService } = require('../diContainer');

async function getFriends(req, res) {
  const { userId } = req.params;
  try {
    const friends = await friendService.getFriendsList(userId);
    res.json(friends);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { getFriends };
const FriendService = require('../application/FriendService');

async function getFriends(req, res) {
  const { userId } = req.params;
  try {
    const friends = await FriendService.getFriendsList(userId);
    res.json(friends);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { getFriends };
const { friendService } = require('../diContainer');

async function getFriends(req, res) {
  const { userId } = req.params;
  const friends = await friendService.getFriendsList(userId);
  res.json(friends);
}

module.exports = { getFriends };
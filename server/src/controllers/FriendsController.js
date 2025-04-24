const { friendService, notificationService } = require('../diContainer');

async function getFriends(req, res) {
  const { userId } = req.params;

  const friends = await friendService.getFriendsList(userId);

  notificationService.notifyFriendsListOnlineStatus(userId, friends);

  res.json(friends);
}

module.exports = { getFriends };
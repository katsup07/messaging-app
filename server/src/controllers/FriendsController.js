const { friendService } = require('../diContainer');
const { socketIoController } = require('../providers/socketioController');

async function getFriends(req, res) {
  const { userId } = req.params;

  const friends = await friendService.getFriendsList(userId);

  _notifyFriendsListOnlineStatus(userId, friends);

  res.json(friends);
}

function _notifyFriendsListOnlineStatus(userId, friends) {
  // Get socket.io instance
  const io = socketIoController.getIO();
  const onlineUsers = socketIoController.getOnlineUsers();
  // Compile status of each friend
  const friendsStatus = {};
  for (const friend of friends)
   friendsStatus[friend._id] = onlineUsers.has(friend._id.toString());
  // Send back to requesting client
  io.to(`user_${userId}`).emit('get-friends-status', friendsStatus);
}

module.exports = { getFriends };
const { friendService } = require('../diContainer');
const { socketIoController } = require('../../providers/socketioController');

async function sendFriendRequest(req, res) {
  const { fromUserId, toUserId } = req.validatedBody || req.body;
  
  const newRequest = await friendService.sendFriendRequest(fromUserId, toUserId);
  
  // Emit socket event for real-time notification
  const io = socketIoController.getIO();
  io.to(`user_${toUserId}`).emit('received-friend-request', { friendRequest: newRequest });

  res.json(newRequest);
}

async function getPendingRequests(req, res) {
  const { userId } = req.params;
  const pendingRequests = await friendService.getPendingRequests(userId);
  res.json(pendingRequests);
}

async function respondToRequest(req, res) {
  const { requestId } = req.params;
  const { accept } = req.validatedBody || req.body;

  const updatedRequest = await friendService.respondToFriendRequest(requestId, accept);
  
  // Notify the sender through socket.io
  const io = socketIoController.getIO();
  if(updatedRequest.status === 'accepted' || updatedRequest.status === 'rejected') {
    io.to(`user_${updatedRequest.fromUserId}`).emit('accepted-friend-request');
  }

  res.json(updatedRequest);
}

module.exports = { sendFriendRequest, getPendingRequests, respondToRequest };
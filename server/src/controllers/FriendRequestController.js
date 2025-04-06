const { friendService } = require('../diContainer');
const { socketIoController } = require('../socketio');

async function sendFriendRequest(req, res) {
  const { fromUserId, toUserId } = req.body;
  try {
    const newRequest = await friendService.sendFriendRequest(fromUserId, toUserId);
    const io = socketIoController.getIO();
    io.to(`user_${req.body.toUserId}`).emit('received-friend-request', { friendRequest: newRequest });

    res.json(newRequest);
  } catch (err) {
    if (err.message.includes('not found')) {
      res.status(404).json({ error: err.message });
    } else if (err.message.includes('already')) {
      res.status(400).json({ error: err.message });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
}

async function getPendingRequests(req, res) {
  const { userId } = req.params;
  try {
    const pendingRequests = await friendService.getPendingRequests(userId);
    res.json(pendingRequests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function respondToRequest(req, res) {
  const { requestId } = req.params;
  const { accept } = req.body;

  try {
    const updatedRequest = await friendService.respondToFriendRequest(requestId, accept);
    const io = socketIoController.getIO();
 
     // Send to trigger an update the sending user's friend list
    if(updatedRequest.status === 'accepted' || updatedRequest.status === 'rejected')
      io.to(`user_${updatedRequest.fromUserId}`).emit('accepted-friend-request');

    res.json(updatedRequest);
  } catch (err) {
    if (err.message.includes('not found')) {
      res.status(404).json({ error: err.message });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
}

module.exports = { sendFriendRequest, getPendingRequests, respondToRequest };
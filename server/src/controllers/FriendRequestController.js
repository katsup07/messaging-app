const { friendService } = require('../diContainer');
const { socketIoController } = require('../socketio');

// const message = {
//   senderId,
//   sender,
//   receiverId,
//   content,
//   time,
//   isRead
// };
// _id: number | string;
// fromUserId: number | string;
// toUserId: number | string;
// status: 'pending' | 'accepted' | 'rejected';
// createdAt: string;
// io.to(`user_${req.body.receiverId}`).emit('receive-message', { message });

async function sendFriendRequest(req, res) {
  const { fromUserId, toUserId } = req.body;
  try {
    const newRequest = await friendService.sendFriendRequest(fromUserId, toUserId);
    const io = socketIoController.getIO();
    io.to(`user_${req.body.toUserId}`).emit('receive-friend-request', { friendRequest: newRequest });
    console.log('newRequest:', newRequest);
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
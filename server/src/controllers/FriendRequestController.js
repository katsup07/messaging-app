const { friendService, notificationService } = require('../diContainer');

async function sendFriendRequest(req, res) {
  const { fromUserId, toUserId } = req.validatedBody || req.body;
  
  const newRequest = await friendService.sendFriendRequest(fromUserId, toUserId);
  
  // Notify the recipient through notification service
  notificationService.notifyFriendRequest(toUserId, newRequest);

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
  
  // Notify the sender through notification service
  notificationService.notifyFriendRequestResponse(
    updatedRequest.fromUserId, 
    updatedRequest.status
  );

  res.json(updatedRequest);
}

module.exports = { sendFriendRequest, getPendingRequests, respondToRequest };
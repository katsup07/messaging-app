const express = require('express');
const FriendRequestController = require('../controllers/FriendRequestController');
const { authenticate } = require('../middleware/auth');

function setFriendRequestRoutes(app) {
  const router = express.Router();

  router.post('/', authenticate,FriendRequestController.sendFriendRequest);
  router.get('/pending/:userId', authenticate, FriendRequestController.getPendingRequests);
  router.post('/:requestId/respond', authenticate, FriendRequestController.respondToRequest);

  app.use('/api/friend-requests', router);
}

module.exports = { setFriendRequestRoutes };
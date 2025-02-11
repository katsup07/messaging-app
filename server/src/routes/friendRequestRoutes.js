const express = require('express');
const FriendRequestController = require('../controllers/FriendRequestController');

function setFriendRequestRoutes(app) {
  const router = express.Router();

  router.post('/', FriendRequestController.sendFriendRequest);
  router.get('/pending/:userId', FriendRequestController.getPendingRequests);
  router.post('/:requestId/respond', FriendRequestController.respondToRequest);
  router.get('/stream/:userId', FriendRequestController.initFriendRequestStream);

  app.use('/api/friend-requests', router);
}

module.exports = { setFriendRequestRoutes }; 
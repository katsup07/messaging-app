const express = require('express');
const FriendRequestController = require('../controllers/FriendRequestController');
const { authenticate } = require('../middleware/auth');
const validationService = require('../middleware/validationService');
const { asyncHandler } = require('../middleware/asyncHandler');

function setFriendRequestRoutes(app) {
  const router = express.Router();

  router.post('/', authenticate, validationService.validateFriendRequest(), asyncHandler(FriendRequestController.sendFriendRequest));
  router.get('/pending/:userId', authenticate, asyncHandler(FriendRequestController.getPendingRequests));
  router.post('/:requestId/respond', authenticate, validationService.validateFriendRequestResponse(), asyncHandler(FriendRequestController.respondToRequest));

  app.use('/api/friend-requests', router);
}

module.exports = { setFriendRequestRoutes };
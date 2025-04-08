const express = require('express');
const MessageController = require('../controllers/MessageController');
const { authenticate } = require('../middleware/auth');
const validationService = require('../middleware/validationService');
const { asyncHandler }= require('../middleware/asyncHandler');

function setMessageRoutes(app) {
  const router = express.Router();

  router.get('/:userId', asyncHandler(MessageController.getMessages));
  router.post('/', authenticate, validationService.validateMessage(), asyncHandler(MessageController.saveMessage));

  app.use('/api/messages', router);
}

module.exports = { setMessageRoutes };
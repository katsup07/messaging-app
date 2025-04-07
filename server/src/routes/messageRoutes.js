const express = require('express');
const MessageController = require('../controllers/MessageController');
const { authenticate } = require('../middleware/auth');

function setMessageRoutes(app) {
  const router = express.Router();

  router.get('/:userId', MessageController.getMessages);
  router.post('/', authenticate, MessageController.saveMessage);

  app.use('/api/messages', router);
}

module.exports = { setMessageRoutes };
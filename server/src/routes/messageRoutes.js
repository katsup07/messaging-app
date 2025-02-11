const express = require('express');
const MessageController = require('../controllers/MessageController');

function setMessageRoutes(app) {
  const router = express.Router();

  router.get('/:userId', MessageController.getMessages);
  router.post('/', MessageController.saveMessage);
  router.get('/stream/:userId/:friendId', MessageController.initMessageStream);

  app.use('/api/messages', router);
}

module.exports = { setMessageRoutes };
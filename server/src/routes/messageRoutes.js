const { getMessages, saveMessage } = require('../controllers/MessageController');

function setMessageRoutes(app) {
  app.get('/api/messages/:userId', getMessages);
  app.post('/api/messages', saveMessage);
}

module.exports = { setMessageRoutes };
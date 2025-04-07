const { getFriends } = require('../controllers/FriendsController');
const { authenticate } = require('../middleware/auth');

function setFriendsRoutes(app) {
  app.get('/api/friends/:userId', authenticate, getFriends); 
}

module.exports = { setFriendsRoutes };
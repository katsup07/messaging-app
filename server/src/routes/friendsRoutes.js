const { getFriends } = require('../controllers/FriendsController');

function setFriendsRoutes(app) {
  app.get('/api/friends/:userId', getFriends); 
}

module.exports = { setFriendsRoutes };
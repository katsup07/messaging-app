const { getFriends } = require('../controllers/FriendsController');
const { authenticate } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/asyncHandler');

function setFriendsRoutes(app) {
  app.get('/api/friends/:userId', authenticate, asyncHandler(getFriends)); 
}

module.exports = { setFriendsRoutes };
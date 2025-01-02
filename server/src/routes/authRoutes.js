const { getUsers, findUser, getFriends } = require('../controllers/AuthController');

function setAuthRoutes(app) {
  app.get('/api/auth', getUsers);
  app.post('/api/auth', findUser);
}

module.exports = { setAuthRoutes };
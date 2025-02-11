const express = require('express');
const AuthController = require('../controllers/AuthController');

function setAuthRoutes(app) {
  const router = express.Router();

  router.get('/users', AuthController.getUsers);
  router.post('/', AuthController.findUser);
  router.post('/logout/:userId', AuthController.logout);

  app.use('/api/auth', router);
}

module.exports = { setAuthRoutes };
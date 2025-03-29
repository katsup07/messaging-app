const express = require('express');
const AuthController = require('../controllers/AuthController');

function setAuthRoutes(app) {
  const router = express.Router();

  router.get('/users', AuthController.getUsers);
  router.post('/login', AuthController.login);
  router.post('/logout/:userId', AuthController.logout);
  router.post('/signup', AuthController.signup);

  app.use('/api/auth', router);
}

module.exports = { setAuthRoutes };
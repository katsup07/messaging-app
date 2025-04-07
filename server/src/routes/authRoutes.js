const express = require('express');
const AuthController = require('../controllers/AuthController');
const { authenticate } = require('../middleware/auth');

function setAuthRoutes(app) {
  const router = express.Router();

  // Public routes
  router.post('/login', AuthController.login);
  router.post('/signup', AuthController.signup);
  router.post('/verify-token', AuthController.verifyToken);

  // Protected routes
  router.get('/users', authenticate, AuthController.getUsers);
  router.get('/user/:userId', authenticate, AuthController.findUserById);
  router.post('/logout/:userId', authenticate, AuthController.logout);

  app.use('/api/auth', router);
}

module.exports = { setAuthRoutes };
const express = require('express');
const AuthController = require('../controllers/AuthController');
const { authenticate } = require('../middleware/auth');
const validationService = require('../middleware/validationService');
const { asyncHandler } = require('../middleware/asyncHandler');

function setAuthRoutes(app) {
  const router = express.Router();

  // Public routes
  router.post('/login', validationService.validateLogin(), asyncHandler(AuthController.login));
  router.post('/signup', validationService.validateSignup(), asyncHandler(AuthController.signup));
  router.post('/verify-token', asyncHandler(AuthController.verifyToken));
  router.post('/refresh-token', validationService.validateRefreshToken(), asyncHandler(AuthController.refreshToken));

  // Protected routes
  router.get('/users', authenticate, asyncHandler(AuthController.getUsers));
  router.get('/users/:userId', authenticate, asyncHandler(AuthController.findUserById));
  router.put('/users/:userId', authenticate, validationService.validateUserDetailsUpdate(), asyncHandler(AuthController.updateUserDetails));
  router.post('/logout/:userId', authenticate, asyncHandler(AuthController.logout));

  app.use('/api/auth', router);
}

module.exports = { setAuthRoutes };
const { messageRepository } = require('./repositories/MessageRepository');
const { friendRepository } = require('./repositories/FriendRepository');
const { authRepository } = require('./repositories/AuthRepository');
const { socketIoController } = require('./providers/socketioController');

const AuthService = require('./application/AuthService');
const MessageService = require('./application/MessageService');
const FriendService = require('./application/FriendService');
const UserFacadeService = require('./application/UserFacadeService');
const NotificationService = require('./application/NotificationService');

const authService = new AuthService(authRepository);
const messageService = new MessageService(messageRepository);
const friendService = new FriendService(friendRepository, authRepository);
const userFacadeService = new UserFacadeService(authService, friendService);
const notificationService = new NotificationService(socketIoController);

module.exports = { 
  authService, 
  messageService, 
  friendService, 
  userFacadeService,
  notificationService
};

const { validateRepository } = require('./utils/validateRepository');
const { socketIoController } = require('./providers/socketioController');

// Services
const AuthService = require('./application/AuthService');
const MessageService = require('./application/MessageService');
const FriendService = require('./application/FriendService');
const UserFacadeService = require('./application/UserFacadeService');
const NotificationService = require('./application/NotificationService');

// Repositories
const MessageRepository = require('./repositories/MessageRepository');
const FriendRepository = require('./repositories/FriendRepository');
const AuthRepository = require('./repositories/AuthRepository');

// Contracts
const BaseAuthRepositoryContract = require('./contracts/BaseAuthRepository');
const BaseFriendRepositoryContract = require('./contracts/BaseFriendRepository');
const BaseMessageRepositoryContract = require('./contracts/BaseMessageRepository');

// Validate repositories against their contracts
const validatedAuthRepository = validateRepository(AuthRepository.instance, BaseAuthRepositoryContract, AuthRepository.name);
const validatedFriendRepository = validateRepository(FriendRepository.instance, BaseFriendRepositoryContract, FriendRepository.name);
const validatedMessageRepository = validateRepository(MessageRepository.instance, BaseMessageRepositoryContract, MessageRepository.name);

const authService = new AuthService(validatedAuthRepository);
const messageService = new MessageService(validatedMessageRepository);
const notificationService = new NotificationService(socketIoController);
const friendService = new FriendService(validatedFriendRepository, validatedAuthRepository, notificationService);
const userFacadeService = new UserFacadeService(authService, friendService);

module.exports = { 
  authService, 
  messageService, 
  friendService, 
  userFacadeService,
  notificationService
};

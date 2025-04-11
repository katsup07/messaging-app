const { messageRepository } = require('./repositories/MessageRepository');
const { friendRepository } = require('./repositories/FriendRepository');
const { authRepository } = require('./repositories/AuthRepository');

const AuthService = require('./application/AuthService');
const MessageService = require('./application/MessageService');
const FriendService = require('./application/FriendService');
const UserFacadeService = require('./application/UserFacadeService');

const authService = new AuthService(authRepository);
const messageService = new MessageService(messageRepository);
const friendService = new FriendService(friendRepository, authRepository);
const userFacadeService = new UserFacadeService(authService, friendService);

module.exports = { authService, messageService, friendService, userFacadeService };

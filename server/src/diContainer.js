const { dataRepository} = require('./repositories/DataRepository');
const { messageRepository } = require('./repositories/MessageRepository');
const { friendRepository } = require('./repositories/FriendRepository');
const { authRepository } = require('./repositories/AuthRepository');

const AuthService = require('./application/AuthService');
const MessageService = require('./application/MessageService');
const FriendService = require('./application/FriendService');

const authService = new AuthService(authRepository);
const messageService = new MessageService(messageRepository);
const friendService = new FriendService(dataRepository, friendRepository);

module.exports = { authService, messageService, friendService };

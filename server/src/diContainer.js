const { DataRepository, MessageRepository } = require('./repositories/DataRepository');
const AuthService = require('./application/AuthService');
const MessageService = require('./application/MessageService');
const FriendService = require('./application/FriendService');

const authService = new AuthService(DataRepository);
const messageService = new MessageService(DataRepository, MessageRepository);
const friendService = new FriendService(DataRepository);

module.exports = { authService, messageService, friendService };

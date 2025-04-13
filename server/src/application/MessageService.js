class MessageService {
  constructor(messageRepository) {
    this.messageRepository = messageRepository;
  }

  async getConversation(userId, friendId) {
    try {
      // TODO:
      // Improve performance by shifting filtering to the database level
      // and using indexes on senderId and receiverId fields.
      const messages = await this.messageRepository.getMessages();
      const filteredMessages = messages.filter(message => 
        (message.senderId.toString() === userId.toString() && message.receiverId.toString() === friendId.toString()) ||
        (message.senderId.toString() === friendId.toString() && message.receiverId.toString() === userId.toString())
      );
      return filteredMessages;
    } catch (error) {
      throw new Error(`Failed to get conversation: ${error.message}`);
    }
  }
  
  async saveMessage(message) {
    try {
      if (!this.isValidMessage(message))
        throw new Error('Invalid message format');
 
      if (!message.time)
        message.time = new Date().toISOString();

      const savedMessage = await this.messageRepository.saveMessage(message);
      return savedMessage;
    } catch (error) {
      throw new Error(`Failed to save message: ${error.message}`);
    }
  }

  // helper
  isValidMessage(message) {
    return (
      message &&
      typeof message.senderId !== 'undefined' &&
      typeof message.receiver._id !== 'undefined' &&
      typeof message.content === 'string' &&
      message.content.trim().length > 0
    );
  }
}

module.exports = MessageService;
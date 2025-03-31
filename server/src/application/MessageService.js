

class MessageService {
  constructor(messageRepository) {
    this.messageRepository = messageRepository;
  }

  async getConversation(userId, friendId) {
    try {
      const messages = await this.messageRepository.getMessages();
      return messages.filter(message => 
        (message.senderId.toString() === userId.toString() && message.receiverId.toString() === friendId.toString()) ||
        (message.senderId.toString() === friendId.toString() && message.receiverId.toString() === userId.toString())
      );
    } catch (error) {
      throw new Error(`Failed to get conversation: ${error.message}`);
    }
  }
  
  async saveMessage(message) {
    try {
      if (!this.isValidMessage(message))
        throw new Error('Invalid message format');
      // Add timestamp if not present
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
      typeof message.receiverId !== 'undefined' &&
      typeof message.content === 'string' &&
      message.content.trim().length > 0
    );
  }
}

module.exports = MessageService;

// TODO: Implement these features with DB, not old file system
  // async deleteMessagesBetweenUsers(user1Id, user2Id) {
  //   try {
  //     const messages = await this.dataRepository.getMessages();
  //     const filteredMessages = messages.filter(message => 
  //       !(
  //         (message.senderId.toString() === user1Id.toString() && message.receiverId.toString() === user2Id.toString()) ||
  //         (message.senderId.toString() === user2Id.toString() && message.receiverId.toString() === user1Id.toString())
  //       )
  //     );
  //     await this.dataRepository.saveMessages(filteredMessages);
  //   } catch (error) {
  //     throw new Error(`Failed to delete messages: ${error.message}`);
  //   }
  // }

  // async markMessagesAsRead(userId, friendId) {
  //   try {
  //     const messages = await this.dataRepository.getMessages();
  //     let hasChanges = false;

  //     messages.forEach(message => {
  //       if (message.receiverId.toString() === userId.toString() && 
  //           message.senderId.toString() === friendId.toString() && 
  //           !message.isRead) {
  //         message.isRead = true;
  //         hasChanges = true;
  //       }
  //     });

  //     if (hasChanges) {
  //       await this.dataRepository.saveMessages(messages);
  //     }
  //   } catch (error) {
  //     throw new Error(`Failed to mark messages as read: ${error.message}`);
  //   }
  // }
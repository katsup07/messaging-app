const { mongoDbManager } = require('../../providers/mongoDbManager');
const { logError } = require('../middleware/logger');

const messageFields = {
  senderId: 1, 
  time: 1, 
  sender: 1, 
  content: 1, 
  receiver: { 
    username: 1, 
    email: 1 
  }, 
    receiverId: 1, 
    isRead: 1
  };
class MessageRepository {
  constructor() {
    this.dbName = "messenger-app";
    this.collectionName = "messages";

    //
    this._createIndexes().catch(err => {
      logError("Failed to create indexes:", err);
    });
  }

  async getMessageCollection() {
    const client = await mongoDbManager.getDb();
    return client.db(this.dbName).collection(this.collectionName);
  }

  async getMessages() {
    const messagesCollection = await this.getMessageCollection();
    return await messagesCollection.find({}).toArray();
  }

  async getMessagesBetweenUsers(userId, friendId) {
    const messagesCollection = await this.getMessageCollection();
    return await messagesCollection.find({
      $or: [
        { senderId: userId, receiverId: friendId },
        { senderId: friendId, receiverId: userId }
      ]
    }).sort({ time: 1 }).toArray();
  }

  async saveMessage(message) {
    const messagesCollection = await this.getMessageCollection();
    const result = await messagesCollection.insertOne(message);
    // saved message
    return this.findById(result.insertedId);
    
  }

  async findById(id) {
    const messagesCollection = await this.getMessageCollection();
    return await messagesCollection.findOne({ _id: id }, { projection: messageFields });
  }

  async _createIndexes() {
    const messagesCollection = await this.getMessageCollection();
    await messagesCollection.createIndex({ senderId: 1, receiverId: 1 });
    await messagesCollection.createIndex({ receiverId: 1, senderId: 1 });
    await messagesCollection.createIndex({ time: 1 });
  }

}

module.exports = { messageRepository: new MessageRepository() }
const { getDb } = require('../../config/dbConfig');

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
  }

  async getMessageCollection() {
    const client = await getDb();
    return client.db(this.dbName).collection(this.collectionName);
  }

  async getMessages() {
    const messagesCollection = await this.getMessageCollection();
    return await messagesCollection.find({}).toArray();
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
}

module.exports = { messageRepository: new MessageRepository() }
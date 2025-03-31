const { client } = require('../../mongoDBclient');

const messageFields = {
  id: 1,
  senderId: 1, 
  time: 1, 
  sender: 1, 
  content: 1, 
  receiver: { 
    id: 1, 
    username: 1, 
    email: 1 
  }, 
    receiverId: 1, 
    isRead: 1
  };
class MessageRepository {
  constructor() {
    this.collection = client.db("messenger-app").collection("messages");
  }

  async getMessages() {
    return await this.collection.find({}).toArray();
  }

  async saveMessage(message) {
    const result = await this.collection.insertOne(message);
    // saved message
    return this.findById(result.insertedId)
    
  }

  async findById(id) {
    return await this.collection.findOne({ _id: id }, { projection: messageFields });
  }
}

module.exports = { MessageRepository: new MessageRepository() }
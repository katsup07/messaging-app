const { client } = require('../../mongoDBclient');
const { ObjectId } = require('mongodb');

class AuthRepository {
  constructor() {
    this.userCollection = client.db("messenger-app").collection("users");
  }

  async getUsers() {
    const userResults = await this.userCollection.find({}).toArray();
    return userResults ? userResults : [];
  }

  async saveUser(user) {
    const result = await this.userCollection.insertOne(user);
    return result.insertedId ? this.findById(result.insertedId) : null;
  }

  async updateUser({userId, updateFields}) {
    const objectUserId = new ObjectId(userId);
    await this.userCollection.updateOne({ _id: objectUserId }, { $set: updateFields });
    return await this.userCollection.findOne({ _id: objectUserId });
  }

  async findById(id) {
    const user = await this.userCollection.findOne({ _id: new ObjectId(id) });
    return user;
  }

  async findByEmail(email) {
    return await this.userCollection.findOne({ email });
  }
}

module.exports = { authRepository: new AuthRepository() };
const { client } = require('../../mongoDBclient');

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
    console.log('Updating user:', userId, updateFields);
    await this.userCollection.updateOne({ _id: userId }, { $set: updateFields });
    return await this.userCollection.findOne({ _id: userId });
  }

  async findById(id) {
    return await this.userCollection.findOne({ _id: id });
  }

  async findByEmail(email) {
    return await this.userCollection.findOne({ email });
  }
}

module.exports = { authRepository: new AuthRepository() };
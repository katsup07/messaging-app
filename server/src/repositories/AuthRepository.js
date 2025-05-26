const { mongoDbManager } = require('../providers/mongoDbManager');
const { ObjectId } = require('mongodb');
const BaseAuthRepository = require('../contracts/BaseAuthRepository');

class AuthRepository extends BaseAuthRepository{
  constructor() {
    super();
    this.dbName = "messenger-app";
    this.collectionName = "users";
  }

  async getUsersCollection() {
    const client = await mongoDbManager.getDb();
    return client.db(this.dbName).collection(this.collectionName);
  }

  async getUsers() {
    const usersCollection = await this.getUsersCollection();
    const userResults = await usersCollection.find({}).toArray();
    return userResults ? userResults : [];
  }

  async saveUser(user) {
    const usersCollection = await this.getUsersCollection();
    const result = await usersCollection.insertOne(user);
    return result.insertedId ? this.findById(result.insertedId) : null;
  }

  async updateUser({userId, updateFields}) {
    const usersCollection = await this.getUsersCollection();
    const objectUserId = new ObjectId(userId);
    await usersCollection.updateOne({ _id: objectUserId }, { $set: updateFields });
    return await usersCollection.findOne({ _id: objectUserId });
  }

  async findById(id) {
    console.log(`Finding user by ID: ${id}`);
    const usersCollection = await this.getUsersCollection();
    const user = await usersCollection.findOne({ _id: new ObjectId(id) });
    return user;
  }

  async findByEmail(email) {
    const usersCollection = await this.getUsersCollection();
    return await usersCollection.findOne({ email });
  }
}

module.exports = { instance: new AuthRepository(), name: "AuthRepository" };
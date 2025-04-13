const { getDb } = require('../../config/dbConfig');
const { ObjectId } = require('mongodb');

const friendRequestFields = {
  _id: 1,
  fromUserId: 1,
  toUserId: 1,
  status: 1,
  createdAt: 1,
  respondedAt: 1,
};

class FriendRepository {
  constructor(){
    this.dbName = "messenger-app";
    this.friendRequestsCollectionName = "friend-requests";
    this.friendsCollectionName = "friends";
  }

  async getFriendRequestsCollection() {
    const client = await getDb();
    return client.db(this.dbName).collection(this.friendRequestsCollectionName);
  }

  async getFriendsCollection() {
    const client = await getDb();
    return client.db(this.dbName).collection(this.friendsCollectionName);
  }

  async getFriendRequests() {
    const friendRequestsCollection = await this.getFriendRequestsCollection();
    const friendRequestResults = await friendRequestsCollection.find({}).toArray();
    return friendRequestResults ? friendRequestResults : [];
  }

  async saveFriendRequests(friendRequests) {
    const friendRequestsCollection = await this.getFriendRequestsCollection();
    const result = await friendRequestsCollection.insertMany(friendRequests);
    const FriendsIds = Object.values(result.insertedIds); 
    return FriendsIds;
  }

  async findById(id) {
    const friendRequestsCollection = await this.getFriendRequestsCollection();
    return await friendRequestsCollection.findOne({ _id: id }, { projection: friendRequestFields });
  }

  async saveFriends(friends) {
    const friendsCollection = await this.getFriendsCollection();
    const result = await friendsCollection.insertMany(friends);
    const FriendsIds = Object.values(result.insertedIds); 
    return FriendsIds;
  }

  async updateUserDataInAllFriendsLists(friendId, updateFields){
    const friendIdObject = new ObjectId(friendId);
    const friendsCollection = await this.getFriendsCollection();

    const [friendsResult, userResult] = await Promise.all([
      friendsCollection.updateMany(
        { "friends._id": friendIdObject },
        { $set: { 
          "friends.$.username": updateFields.username, 
          "friends.$.email": updateFields.email 
        } 
      }),
      friendsCollection.updateOne(
        {"user._id": friendIdObject},
        { $set: { 
          "user.username": updateFields.username, 
          "user.email": updateFields.email 
        }
      })
    ]);
    
    return { isSuccess: friendsResult.acknowledged === true && userResult.acknowledged === true };
  }

  async getFriends() {
    const friendsCollection = await this.getFriendsCollection();
    const friendResults = await friendsCollection.find({}).toArray();
    return friendResults ? friendResults : [];
  }

  async clearFriendsCollection() {
    const friendsCollection = await this.getFriendsCollection();
    await friendsCollection.deleteMany({});
    return true;
  }

  async _areAlreadyFriends(userId, friendId) {
    const friendsCollection = await this.getFriendsCollection();
    const retrievedFriend = await friendsCollection.findOne({ "user._id": new ObjectId(userId) });
    if (!retrievedFriend) return false;
  
    return retrievedFriend.friends.some(friend => friend._id.toString() === friendId.toString());
  }

  async areFriends(userId, friendId) {
    const fromUserFriends = await this._areAlreadyFriends(userId, friendId);
    const toUserFriends = await this._areAlreadyFriends(friendId, userId);
    return fromUserFriends || toUserFriends;
  }

  async insertFriendRequest(request) {
    const friendRequestsCollection = await this.getFriendRequestsCollection();
    await friendRequestsCollection.insertOne(request);
    return request;
  }

  async updateFriendRequest(requestId, updateFields) {
    const friendRequestsCollection = await this.getFriendRequestsCollection();
    const _id = new ObjectId(requestId);
    await friendRequestsCollection.updateOne({ _id }, { $set: updateFields });
    return await friendRequestsCollection.findOne({ _id });
  }

  async findPendingRequest(fromUserId, toUserId) {
    const friendRequestsCollection = await this.getFriendRequestsCollection();
    return await friendRequestsCollection.findOne({ 
      fromUserId: new ObjectId(fromUserId),
      toUserId: new ObjectId(toUserId), 
      status: 'pending' 
    });
  }

  async findFriendRequestById(requestId) {
    const friendRequestsCollection = await this.getFriendRequestsCollection();
    const result = await friendRequestsCollection.findOne({ _id: new ObjectId(requestId) });

    return result ? result : null; 
  }

  async updateOrCreateFriendship(userId, username, friendData) {
    const friendsCollection = await this.getFriendsCollection();
    const userDoc = await friendsCollection.findOne({ "user._id": userId });
        // If user doesn't exist, create new document with initial friend
    if (!userDoc){
    await friendsCollection.insertOne({
      user: { _id: userId, username },
      friends: [friendData]
    });
    return;
  }
    // If user exists, check if the friend already exists in their friends array
    const friendExists = userDoc.friends && userDoc.friends.some(
      friend => friend._id.toString() === friendData._id.toString()
    );
    if (friendExists) {
    // Update the existing friend entry
      await friendsCollection.updateOne(
        { "user._id": userId, "friends._id": friendData._id },
        { $set: { "friends.$": friendData } }
      );
    } else {
      // Friend does not exists, so add as a new friend
      await friendsCollection.updateOne(
        { "user._id": userId },
        { $addToSet: { friends: friendData } }
       );
    }
  }
}

module.exports = { friendRepository: new FriendRepository() }
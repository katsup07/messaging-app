const { client } = require('../../mongoDBclient');
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
    this.friendRequestsCollection = client.db("messenger-app").collection("friend-requests");
    this.friendsCollection = client.db("messenger-app").collection("friends");
  }

  async getFriendRequests() {
    const friendRequestResults = await this.friendRequestsCollection.find({}).toArray();
    return friendRequestResults ? friendRequestResults : []; // Return empty array if no results found
  }

  async saveFriendRequests(friendRequests) {
    const result = await this.friendRequestsCollection.insertMany(friendRequests);
    const FriendsIds = Object.values(result.insertedIds); 
    return FriendsIds;
  }

  async findById(id) {
    return await this.friendRequestsCollection.findOne({ _id: id }, { projection: friendRequestFields });
  }

  async saveFriends(friends) {
    const result = await this.friendsCollection.insertMany(friends);
    const FriendsIds = Object.values(result.insertedIds); 
    return FriendsIds;
  }

  async getFriends() {
    const friendResults = await this.friendsCollection.find({}).toArray();
    return friendResults ? friendResults : []; // Return empty array if no results found
  }

  async clearFriendsCollection() {
    await this.friendsCollection.deleteMany({});
    return true;
  }

  async _areAlreadyFriends(userId, friendId) {
    const retrievedFriend = await this.friendsCollection.findOne({ "user._id": new ObjectId(userId) });
    if (!retrievedFriend) return false; // No friends found for the user
  
    return retrievedFriend.friends.some(friend => friend._id.toString() === friendId.toString());
  }

  async areFriends(userId, friendId) {
    const fromUserFriends = await this._areAlreadyFriends(userId, friendId);
    const toUserFriends = await this._areAlreadyFriends(friendId, userId);
    return fromUserFriends || toUserFriends;
  }

  async insertFriendRequest(request) {
    await this.friendRequestsCollection.insertOne(request);
    return request;
  }

  async updateFriendRequest(requestId, updateFields) {
    const _id = new ObjectId(requestId);
    await this.friendRequestsCollection.updateOne({ _id }, { $set: updateFields });
    return await this.friendRequestsCollection.findOne({ _id });
  }

  async findPendingRequest(fromUserId, toUserId) {
    return await this.friendRequestsCollection.findOne({ 
      fromUserId: new ObjectId(fromUserId),
      toUserId: new ObjectId(toUserId), 
      status: 'pending' 
    });
  }

  async findFriendRequestById(requestId) {
    const result = await this.friendRequestsCollection.findOne({ _id: new ObjectId(requestId) });

    return result ? result : null; // Return null if no results found
  }

  async updateOrCreateFriendship(userId, username, friendData) {
    // First, check if the user document exists
    const userDoc = await this.friendsCollection.findOne({ "user._id": userId });
    if (!userDoc){
    // If user doesn't exist, create new document with initial friend
    await this.friendsCollection.insertOne({
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
      await this.friendsCollection.updateOne(
        { "user._id": userId, "friends._id": friendData._id },
        { $set: { "friends.$": friendData } }
      );
    } else {
      // Friend does not exists, so add as a new friend
      await this.friendsCollection.updateOne(
        { "user._id": userId },
        { $addToSet: { friends: friendData } }
       );
    }
  }
}

module.exports = { friendRepository: new FriendRepository() }
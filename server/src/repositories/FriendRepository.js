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

  // New method to clear the friends collection before updating
  async clearFriendsCollection() {
    await this.friendsCollection.deleteMany({});
    return true;
  }

  async areAlreadyFriends(userId, friendId) {
    const retrievedFriend = await this.friendsCollection.findOne({ "user._id": new ObjectId(userId) });
    if (!retrievedFriend) return false; // No friends found for the user
    return retrievedFriend.friends.some(friend => friend._id.toString() === friendId.toString());
  }

  // New: Check if two users are friends in either direction
  async areFriends(userId, friendId) {
    const fromUserFriends = await this.areAlreadyFriends(userId, friendId);
    const toUserFriends = await this.areAlreadyFriends(friendId, userId);
    return fromUserFriends || toUserFriends;
  }

  // New: Insert a single friend request
  async insertFriendRequest(request) {
    await this.friendRequestsCollection.insertOne(request);
    return request;
  }

  // New: Update a friend request by its custom id field
  async updateFriendRequest(requestId, updateFields) {
    const _id = new ObjectId(requestId);
    await this.friendRequestsCollection.updateOne({ _id }, { $set: updateFields });
    return await this.friendRequestsCollection.findOne({ _id });
  }

  // New: Find a pending friend request
  async findPendingRequest(fromUserId, toUserId) {
    return await this.friendRequestsCollection.findOne({ 
      fromUserId: new ObjectId(fromUserId),
      toUserId: new ObjectId(toUserId), 
      status: 'pending' 
    });
  }

  // New: Find a friend request by its id
  async findFriendRequestById(requestId) {
    const result = await this.friendRequestsCollection.findOne({ _id: new ObjectId(requestId) });

    return result ? result : null; // Return null if no results found
  }

  // Update or create a friendship entry for a user
  async updateOrCreateFriendship(userId, friendData) {
    const query = { "user._id": userId };
    const update = {
      $setOnInsert: { user: { _id: userId, username: friendData.username } },
      $addToSet: { friends: friendData }
    };
    const options = { upsert: true };
    
    await this.friendsCollection.updateOne(query, update, options);
    return true;
  }
}

module.exports = { friendRepository: new FriendRepository() }
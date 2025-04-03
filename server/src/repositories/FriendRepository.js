const { client } = require('../../mongoDBclient');

const friendRequestFields = {
  id: 1,
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
    console.log(`Inserted ${result.insertedCount} friend requests`);
    console.log('result in saveFriendRequests:', result.insertedIds[0]);
    return result.insertedIds[0];
  }

  async findById(id) {
    return await this.friendRequestsCollection.findOne({ _id: id }, { projection: friendRequestFields });
  }

  async saveFriends(friends) {
    const result = await this.friendsCollection.insertMany(friends);
    console.log(`Inserted ${result.insertedCount} friends`);
    console.log('result in saveFriends:', result);
    return result.insertedIds.map(id => this.findById(id));
  }

  async getFriends() {
    const friendResults = await this.friendsCollection.find({}).toArray();
    console.log('Fetched friends:', friendResults);
    return friendResults ? friendResults : []; // Return empty array if no results found
  }

  // New: Insert a single friend request
  async insertFriendRequest(request) {
    const result = await this.friendRequestsCollection.insertOne(request);
    // minimal logging
    console.log(`Inserted friend request with id ${request.id}`);
    return request;
  }

  // New: Update a friend request by its custom id field
  async updateFriendRequest(requestId, updateFields) {
    await this.friendRequestsCollection.updateOne({ id: requestId }, { $set: updateFields });
    return await this.friendRequestsCollection.findOne({ id: requestId });
  }

  // New: Find a pending friend request
  async findPendingRequest(fromUserId, toUserId) {
    return await this.friendRequestsCollection.findOne({ 
      fromUserId, 
      toUserId, 
      status: 'pending' 
    });
  }

  // New: Find a friend request by its id
  async findFriendRequestById(requestId) {
    const result = await this.friendRequestsCollection.findOne({ id: requestId });
    console.log('findFriendRequestById result:', result);
    return result ? result : null; // Return null if no results found
  }
}

module.exports = { friendRepository: new FriendRepository() }
const DataRepository = require('../repositories/DataRepository');

class FriendService {
  constructor(dataRepository) {
    this.dataRepository = dataRepository;
  }

  async getFriendsList(userId) {
    try {
      const friends = await this.dataRepository.getFriends();
      const userFriends = friends.find(f => f.user.id.toString() === userId.toString());
      return userFriends ? userFriends.friends : [];
    } catch (error) {
      throw new Error(`Failed to get friends list: ${error.message}`);
    }
  }

  async sendFriendRequest(fromUserId, toUserId) {
    try {
      const [requests, users, friends] = await Promise.all([
        this.dataRepository.getFriendRequests(),
        this.dataRepository.getUsers(),
        this.dataRepository.getFriends()
      ]);

      // Validate users exist
      const fromUser = users.find(u => u.id.toString() === fromUserId.toString());
      const toUser = users.find(u => u.id.toString() === toUserId.toString());
      
      if (!fromUser || !toUser) {
        throw new Error('One or both users not found');
      }

      // Check if request already exists
      const existingRequest = requests.find(
        r => r.fromUserId.toString() === fromUserId.toString() && 
             r.toUserId.toString() === toUserId.toString() &&
             r.status === 'pending'
      );

      if (existingRequest) {
        throw new Error('Friend request already sent');
      }

      // Check if they're already friends
      const areFriends = friends.some(f => 
        (f.user.id.toString() === fromUserId.toString() && 
         f.friends.some(fr => fr.id.toString() === toUserId.toString())) ||
        (f.user.id.toString() === toUserId.toString() && 
         f.friends.some(fr => fr.id.toString() === fromUserId.toString()))
      );

      if (areFriends) {
        throw new Error('Users are already friends');
      }

      // Create new request
      const newRequest = {
        id: `${fromUserId}-${toUserId}-${Date.now()}`,
        fromUserId,
        toUserId,
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      requests.push(newRequest);
      await this.dataRepository.saveFriendRequests(requests);
      return newRequest;
    } catch (error) {
      throw new Error(`Failed to send friend request: ${error.message}`);
    }
  }

  async getPendingRequests(userId) {
    try {
      const requests = await this.dataRepository.getFriendRequests();
      return requests.filter(
        r => r.toUserId.toString() === userId.toString() && r.status === 'pending'
      );
    } catch (error) {
      throw new Error(`Failed to get pending requests: ${error.message}`);
    }
  }

  async respondToFriendRequest(requestId, accept) {
    try {
      const [requests, friends, users] = await Promise.all([
        this.dataRepository.getFriendRequests(),
        this.dataRepository.getFriends(),
        this.dataRepository.getUsers()
      ]);

      const requestIndex = requests.findIndex(r => r.id === requestId);
      if (requestIndex === -1) {
        throw new Error('Friend request not found');
      }

      const request = requests[requestIndex];
      
      if (accept) {
        const fromUser = users.find(u => u.id.toString() === request.fromUserId.toString());
        const toUser = users.find(u => u.id.toString() === request.toUserId.toString());

        if (!fromUser || !toUser) {
          throw new Error('One or both users not found');
        }

        await this.addFriendship(friends, fromUser, toUser);
      }

      // Update request status
      requests[requestIndex].status = accept ? 'accepted' : 'rejected';
      requests[requestIndex].respondedAt = new Date().toISOString();
      
      await this.dataRepository.saveFriendRequests(requests);
      return requests[requestIndex];
    } catch (error) {
      throw new Error(`Failed to respond to friend request: ${error.message}`);
    }
  }

  async addFriendship(friends, user1, user2) {
    try {
      // Add to user1's friends
      let user1Friends = friends.find(f => f.user.id.toString() === user1.id.toString());
      if (!user1Friends) {
        user1Friends = { 
          user: { 
            id: user1.id, 
            username: user1.username 
          }, 
          friends: [] 
        };
        friends.push(user1Friends);
      }
      
      if (!user1Friends.friends.some(f => f.id.toString() === user2.id.toString())) {
        user1Friends.friends.push({
          id: user2.id,
          username: user2.username,
          email: user2.email
        });
      }

      // Add to user2's friends
      let user2Friends = friends.find(f => f.user.id.toString() === user2.id.toString());
      if (!user2Friends) {
        user2Friends = { 
          user: { 
            id: user2.id, 
            username: user2.username 
          }, 
          friends: [] 
        };
        friends.push(user2Friends);
      }
      
      if (!user2Friends.friends.some(f => f.id.toString() === user1.id.toString())) {
        user2Friends.friends.push({
          id: user1.id,
          username: user1.username,
          email: user1.email
        });
      }

      await this.dataRepository.saveFriends(friends);
    } catch (error) {
      throw new Error(`Failed to add friendship: ${error.message}`);
    }
  }
}

module.exports = new FriendService(DataRepository); 
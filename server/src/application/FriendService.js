
// TODO: Delete dataRespository after friendRepository is fully implemented
class FriendService {
  constructor(dataRepository, friendRepository) {
    this.dataRepository = dataRepository;
    this.friendRepository = friendRepository;
  }

  async getFriendsList(userId) {
    try {
      const friends = await this.friendRepository.getFriends();
      const userFriends = friends.find(f => f.user.id.toString() === userId.toString());
      return userFriends ? userFriends.friends : [];
    } catch (error) {
      throw new Error(`Failed to get friends list: ${error.message}`);
    }
  }

  async sendFriendRequest(fromUserId, toUserId) {
    try {
      // Validate users exist
      const users = await this.dataRepository.getUsers();
      const fromUser = users.find(u => u.id.toString() === fromUserId.toString());
      const toUser = users.find(u => u.id.toString() === toUserId.toString());
      if (!fromUser || !toUser) {
        throw new Error('One or both users not found');
      }

      // Check if a pending request already exists
      const existingRequest = await this.friendRepository.findPendingRequest(fromUserId, toUserId);
      if (existingRequest) {
        throw new Error('Friend request already sent');
      }

      // Check if they're already friends
      const friends = await this.friendRepository.getFriends();
      const areFriends = friends.some(f => 
        (f.user.id.toString() === fromUserId.toString() && 
         f.friends.some(fr => fr.id.toString() === toUserId.toString())) ||
        (f.user.id.toString() === toUserId.toString() && 
         f.friends.some(fr => fr.id.toString() === fromUserId.toString()))
      );
      if (areFriends) {
        throw new Error('Users are already friends');
      }

      // Create and insert new request
      const newRequest = {
        id: `${fromUserId}-${toUserId}-${Date.now()}`,
        fromUserId,
        toUserId,
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      await this.friendRepository.insertFriendRequest(newRequest);
      return newRequest;
    } catch (error) {
      throw new Error(`Failed to send friend request: ${error.message}`);
    }
  }

  async getPendingRequests(userId) {
    try {
      const requests = await this.friendRepository.getFriendRequests();
      return requests.filter(
        r => r.toUserId.toString() === userId.toString() && r.status === 'pending'
      );
    } catch (error) {
      throw new Error(`Failed to get pending requests: ${error.message}`);
    }
  }

  async respondToFriendRequest(requestId, accept) {
    try {
      // Find the specific request
      const request = await this.friendRepository.findFriendRequestById(requestId);
      if (!request) {
        throw new Error('Friend request not found');
      }
      
      // If accepted, add friendship between users
      if (accept) {
        const users = await this.dataRepository.getUsers();
        const fromUser = users.find(u => u.id.toString() === request.fromUserId.toString());
        const toUser = users.find(u => u.id.toString() === request.toUserId.toString());
        if (!fromUser || !toUser) {
          throw new Error('One or both users not found');
        }
        await this.addFriendship(await this.friendRepository.getFriends(), fromUser, toUser);
      }

      // Update the friend request status
      const updatedRequest = await this.friendRepository.updateFriendRequest(requestId, {
        status: accept ? 'accepted' : 'rejected',
        respondedAt: new Date().toISOString()
      });
      return updatedRequest;
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

      // TODO: Currently adds duplicates and cannot accept friend requests. Need to fix.
      await this.friendRepository.saveFriends(friends);
    } catch (error) {
      throw new Error(`Failed to add friendship: ${error.message}`);
    }
  }
}

module.exports = FriendService;
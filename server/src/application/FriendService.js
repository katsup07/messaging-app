// TODO: Delete dataRespository after friendRepository is fully implemented
class FriendService {
  constructor(friendRepository, authRepository) {
    this.friendRepository = friendRepository;
    this.authRepository = authRepository;
  }

  async getFriendsList(userId) {
    try {
      const friends = await this.friendRepository.getFriends();
      const userFriends = friends.find(f => f.user._id.toString() === userId.toString());
      return userFriends ? userFriends.friends : [];
    } catch (error) {
      throw new Error(`Failed to get friends list: ${error.message}`);
    }
  }

  async sendFriendRequest(fromUserId, toUserId) {
    try {
      console.log('Sending friend request from:', fromUserId, 'to:', toUserId);
      // Validate users exist
      const fromUser = await this.authRepository.findById(fromUserId);
      console.log('aaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
      const toUser = await this.authRepository.findById(toUserId);
      console.log('bbbbbbbbbbbbbbbbbbbbbbbbbbbbb');
      
      if (!fromUser || !toUser)
        throw new Error('One or both users not found');

      console.log('ccccccccccccccccccccccccccccc');

      // Check if a pending request already exists
      const existingRequest = await this.friendRepository.findPendingRequest(fromUserId, toUserId);

      console.log('ddddddddddddddddddddddddddddd');
      if (existingRequest)
        throw new Error('Friend request already sent');

      console.log('eeeeeeeeeeeeeeeeeeeeeeeeeeeee');

      // Simplified friendship check using the new areFriends method
      const areFriends = await this.friendRepository.areFriends(fromUserId, toUserId);
      console.log('fffffffffffffffffffffffffffff');
      if (areFriends)
        throw new Error('Users are already friends');

      console.log('ggggggggggggggggggggggggggg');

      // Create and insert new request
      const newRequest = {
        fromUserId,
        toUserId,
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      console.log('hhhhhhhhhhhhhhhhhhhhhhhhhhhhh');
      await this.friendRepository.insertFriendRequest(newRequest);
      console.log('iiiiiiiiiiiiiiiiiiiiiiiiiiiii');
      return newRequest;
    } catch (error) {
      console.log('Thoring error here!!!')
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
      if (!request)
        throw new Error('Friend request not found');
      
      // If accepted, add friendship between users
      if (accept) {
        const fromUser = await this.authRepository.findById(request.fromUserId);
        const toUser = await this.authRepository.findById(request.toUserId);
        if (!fromUser || !toUser)
          throw new Error('One or both users not found');
        
        await this.addFriendship(fromUser, toUser);
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

  async addFriendship(user1, user2) {
    
    try {
      // Add user2 to user1's friends
      const user1FriendData = {
        _id: user2._id,
        username: user2.username,
        email: user2.email
      };
      await this.friendRepository.updateOrCreateFriendship(user1._id, user1FriendData);
      
      // Add user1 to user2's friends
      const user2FriendData = {
        _id: user1._id,
        username: user1.username,
        email: user1.email
      };
      await this.friendRepository.updateOrCreateFriendship(user2._id, user2FriendData);
      
      return true;
    } catch (error) {
      throw new Error(`Failed to add friendship: ${error.message}`);
    }
  }
}

module.exports = FriendService;
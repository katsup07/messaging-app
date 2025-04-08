const { throwError } = require('../utils/throwError');

class FriendService {
  constructor(friendRepository, authRepository) {
    this.friendRepository = friendRepository;
    this.authRepository = authRepository;
  }

  async getFriendRequestById(requestId) {
    const request = await this.friendRepository.findFriendRequestById(requestId);
    if (!request) throwError('Friend request not found', 404);
    return request;
  }

  async getFriendsList(userId) {
    try {
      const friends = await this.friendRepository.getFriends();
      const userFriends = friends.find(f => f.user._id.toString() === userId.toString());
      return userFriends ? userFriends.friends : [];
    } catch (error) {
      throwError(`Failed to get friends list: ${error.message}`, 500);
    }
  }

  async sendFriendRequest(fromUserId, toUserId) {
    const fromUser = await this.authRepository.findById(fromUserId);
    const toUser = await this.authRepository.findById(toUserId);
    
    if (!fromUser || !toUser)
      throwError('One or both users not found', 404);

    const existingRequest = await this.friendRepository.findPendingRequest(fromUserId, toUserId);

    if (existingRequest)
      throwError('Friend request already sent', 400);

    const areFriends = await this.friendRepository.areFriends(fromUserId, toUserId);
    if (areFriends)
      throwError('Users are already friends or one party declined the request', 400);

    const newRequest = {
      fromUserId,
      toUserId,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    await this.friendRepository.insertFriendRequest(newRequest);
    await this.addPendingFriendship(fromUser, toUser); // pending friendship until accepted
    return newRequest;
  }

  async addPendingFriendship(user1, user2) {
    const user1FriendData = {
      _id: user2._id,
      username: user2.username,
      email: user2.email,
      isPending: true 
    };
    await this.friendRepository.updateOrCreateFriendship(user1._id, user1.username, user1FriendData);
  }

  async getPendingRequests(userId) {
    try {
      const requests = await this.friendRepository.getFriendRequests();
      return requests.filter(
        r => r.toUserId.toString() === userId.toString() && r.status === 'pending'
      );
    } catch (error) {
      throwError(`Failed to get pending requests: ${error.message}`, 500);
    }
  }

  async respondToFriendRequest(requestId, accept) {
    const request = await this.friendRepository.findFriendRequestById(requestId);
    if (!request)
      throwError('Friend request not found', 404);
    
    // If accepted, add friendship between users
    if (accept) {
      const fromUser = await this.authRepository.findById(request.fromUserId);
      const toUser = await this.authRepository.findById(request.toUserId);
      if (!fromUser || !toUser)
        throwError('One or both users not found', 404);
      
      await this.addFriendship(fromUser, toUser);
    } else {
      // If rejected, remove the pending friendship
      const fromUser = await this.authRepository.findById(request.fromUserId);
      const toUser = await this.authRepository.findById(request.toUserId);
      if(!fromUser || !toUser) 
        throwError('One or both users not found', 404);
  
      const user1FriendData = {
        _id: toUser._id,
        username: toUser.username,
        email: toUser.email,
        isPending: false,
        isRejected: true
      };
      const user2FriendData = {
        _id: fromUser._id, 
        username: fromUser.username,
        email: fromUser.email,
        isPending: false,
        isRejected: true
      };
    
      await this.friendRepository.updateOrCreateFriendship(fromUser._id, fromUser.username, user1FriendData);
      await this.friendRepository.updateOrCreateFriendship(toUser._id, toUser.username, user2FriendData);
    }

    // Update the friend request status
    const updatedRequest = await this.friendRepository.updateFriendRequest(requestId, {
      status: accept ? 'accepted' : 'rejected',
      respondedAt: new Date().toISOString()
    });
    return updatedRequest;
  }

  async addFriendship(user1, user2) {
    try {
      // Add user2 to user1's friends
      const user1FriendData = {
        _id: user2._id,
        username: user2.username,
        email: user2.email,
        isPending: false,
        isRejected: false,
      };
      await this.friendRepository.updateOrCreateFriendship(user1._id, user1.username, user1FriendData);
      
      // Add user1 to user2's friends
      const user2FriendData = {
        _id: user1._id,
        username: user1.username,
        email: user1.email,
        isPending: false,
        isRejected: false,
      };
      await this.friendRepository.updateOrCreateFriendship(user2._id, user2.username, user2FriendData);
      
      return true;
    } catch (error) {
      throwError(`Failed to add friendship: ${error.message}`, 500);
    }
  }
}

module.exports = FriendService;
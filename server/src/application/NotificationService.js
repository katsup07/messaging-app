class NotificationService {
  constructor(socketProvider) {
    this.socketProvider = socketProvider;
  }

  // Friend status notifications
  notifyFriendsListOnlineStatus(userId, friends) {
    const io = this.socketProvider.getIO();
    const onlineUsers = this.socketProvider.getOnlineUsers();
    
    const friendsStatus = {};
    for (const friend of friends)
      friendsStatus[friend._id] = onlineUsers.has(friend._id.toString());
    
    io.to(`user_${userId}`).emit('get-friends-status', friendsStatus);
  }

  // Friend request notifications
  notifyFriendRequest(toUserId, friendRequest) {
    const io = this.socketProvider.getIO();
    io.to(`user_${toUserId}`).emit('received-friend-request', { friendRequest });
  }

  notifyFriendRequestResponse(fromUserId, status) {
    const io = this.socketProvider.getIO();
    if (status === 'accepted' || status === 'rejected') {
      io.to(`user_${fromUserId}`).emit('accepted-friend-request');
    }
  }

  // Message notifications
  notifyNewMessage(receiverId, message) {
    const io = this.socketProvider.getIO();
    // Notify receiver
    io.to(`user_${receiverId}`).emit('receive-message', { message });
    // Notify sender
    if (message.senderId)
      io.to(`user_${message.senderId}`).emit('receive-message', { message });
  }

  // Status change notifications
  async notifyStatusChange(userId, isOnline, friendService) {
    try {
      const friends = await friendService.getFriendsList(userId);
      const io = this.socketProvider.getIO();
      const onlineUsers = this.socketProvider.getOnlineUsers();
      
      for (const friend of friends) {
        const friendSocketId = onlineUsers.get(friend._id);
        if (!friendSocketId) continue;
        
        io.to(friendSocketId).emit('user-status-change', {
          userId,
          isOnline,
        });
      }
    } catch (err) {
      console.error('Error notifying friends:', err);
    }
  }
}

module.exports = NotificationService;
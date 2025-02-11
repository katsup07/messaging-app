const FileService = require('../services/FileService');

// Store active SSE clients
const clients = new Map();

async function initFriendRequestStream(req, res) {
  const { userId } = req.params;

  // Set SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });
  res.write('\n');

  // Store the client connection
  clients.set(userId, res);

  // Send initial friend requests
  const requests = await FileService.getFriendRequests();
  const pendingRequests = requests.filter(
    r => r.toUserId.toString() === userId.toString() && r.status === 'pending'
  );
  res.write(`data: ${JSON.stringify({
    type: 'requests',
    data: pendingRequests
  })}\n\n`);

  // Remove client on connection close
  req.on('close', () => {
    clients.delete(userId);
  });
}

async function sendFriendRequest(req, res) {
  const { fromUserId, toUserId } = req.body;
  try {
    const requests = await FileService.getFriendRequests();
    const users = await FileService.getUsers();

    // Validate both users exist
    const fromUser = users.find(u => u.id.toString() === fromUserId.toString());
    const toUser = users.find(u => u.id.toString() === toUserId.toString());
    
    if (!fromUser || !toUser) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Check if request already exists
    const existingRequest = requests.find(
      r => r.fromUserId.toString() === fromUserId.toString() && 
           r.toUserId.toString() === toUserId.toString() &&
           r.status === 'pending'
    );

    if (existingRequest) {
      res.status(400).json({ error: 'Friend request already sent' });
      return;
    }

    // Check if they're already friends
    const friends = await FileService.getFriends();
    const areFriends = friends.some(f => 
      (f.user.id.toString() === fromUserId.toString() && 
       f.friends.some(fr => fr.id.toString() === toUserId.toString())) ||
      (f.user.id.toString() === toUserId.toString() && 
       f.friends.some(fr => fr.id.toString() === fromUserId.toString()))
    );

    if (areFriends) {
      res.status(400).json({ error: 'Users are already friends' });
      return;
    }

    // Add new request with a unique ID
    const newRequest = {
      id: `${fromUserId}-${toUserId}-${Date.now()}`,
      fromUserId,
      toUserId,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    requests.push(newRequest);
    await FileService.saveFriendRequests(requests);

    // Notify the recipient about the new request
    const recipientClient = clients.get(toUserId.toString());
    if (recipientClient) {
      const pendingRequests = requests.filter(
        r => r.toUserId.toString() === toUserId.toString() && r.status === 'pending'
      );
      recipientClient.write(`data: ${JSON.stringify(pendingRequests)}\n\n`);
    }

    res.json(newRequest);
  } catch (err) {
    res.status(500).json({ error: 'Failed to send friend request' });
  }
}

async function getPendingRequests(req, res) {
  const { userId } = req.params;
  try {
    const requests = await FileService.getFriendRequests();
    const pendingRequests = requests.filter(
      r => r.toUserId.toString() === userId.toString() && r.status === 'pending'
    );
    res.json(pendingRequests);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get pending requests' });
  }
}

async function respondToRequest(req, res) {
  const { requestId } = req.params;
  const { accept } = req.body;
  
  try {
    const requests = await FileService.getFriendRequests();
    const requestIndex = requests.findIndex(r => r.id === requestId);
    
    if (requestIndex === -1) {
      res.status(404).json({ error: 'Request not found' });
      return;
    }

    const request = requests[requestIndex];
    
    if (accept) {
      // Add users to each other's friend lists
      const friends = await FileService.getFriends();
      const users = await FileService.getUsers();
      
      const fromUser = users.find(u => u.id.toString() === request.fromUserId.toString());
      const toUser = users.find(u => u.id.toString() === request.toUserId.toString());

      if (!fromUser || !toUser) {
        res.status(404).json({ error: 'One or both users not found' });
        return;
      }

      // Add to fromUser's friends
      let fromUserFriends = friends.find(f => f.user.id.toString() === fromUser.id.toString());
      if (!fromUserFriends) {
        fromUserFriends = { 
          user: { 
            id: fromUser.id, 
            username: fromUser.username 
          }, 
          friends: [] 
        };
        friends.push(fromUserFriends);
      }
      
      // Check if they're not already friends
      if (!fromUserFriends.friends.some(f => f.id === toUser.id)) {
        fromUserFriends.friends.push({
          id: toUser.id,
          username: toUser.username,
          email: toUser.email
        });
      }

      // Add to toUser's friends
      let toUserFriends = friends.find(f => f.user.id.toString() === toUser.id.toString());
      if (!toUserFriends) {
        toUserFriends = { 
          user: { 
            id: toUser.id, 
            username: toUser.username 
          }, 
          friends: [] 
        };
        friends.push(toUserFriends);
      }
      
      // Check if they're not already friends
      if (!toUserFriends.friends.some(f => f.id === fromUser.id)) {
        toUserFriends.friends.push({
          id: fromUser.id,
          username: fromUser.username,
          email: fromUser.email
        });
      }

      await FileService.saveFriends(friends);
    }

    // Update request status
    requests[requestIndex].status = accept ? 'accepted' : 'rejected';
    requests[requestIndex].respondedAt = new Date().toISOString();
    
    await FileService.saveFriendRequests(requests);

    // Notify both users about the updated requests and friend lists
    const recipientClient = clients.get(request.toUserId.toString());
    const senderClient = clients.get(request.fromUserId.toString());

    if (recipientClient) {
      const pendingRequests = requests.filter(
        r => r.toUserId.toString() === request.toUserId.toString() && r.status === 'pending'
      );
      recipientClient.write(`data: ${JSON.stringify({
        type: 'requests',
        data: pendingRequests
      })}\n\n`);

      if (accept) {
        recipientClient.write(`data: ${JSON.stringify({
          type: 'friendsUpdate'
        })}\n\n`);
      }
    }

    if (senderClient && accept) {
      senderClient.write(`data: ${JSON.stringify({
        type: 'friendsUpdate'
      })}\n\n`);
    }

    res.json(requests[requestIndex]);
  } catch (err) {
    console.error('Error responding to friend request:', err);
    res.status(500).json({ error: 'Failed to respond to friend request' });
  }
}

module.exports = { sendFriendRequest, getPendingRequests, respondToRequest, initFriendRequestStream }; 
const FriendService = require('../application/FriendService');

// Store active SSE clients
const clients = new Map();

// Send keep-alive ping to prevent connection timeout
function sendKeepAlive(res) {
  res.write(': ping\n\n');
}

async function initFriendRequestStream(req, res) {
  const { userId } = req.params;

  // Set SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'X-Accel-Buffering': 'no'  // Disable nginx buffering
  });
  res.write('\n');

  // Store the client connection
  clients.set(userId, res);

  // Setup keep-alive ping
  const pingInterval = setInterval(() => sendKeepAlive(res), 30000); // Send ping every 30 seconds

  try {
    // Send initial friend requests
    const pendingRequests = await FriendService.getPendingRequests(userId);
    res.write(`data: ${JSON.stringify({
      type: 'requests',
      data: pendingRequests
    })}\n\n`);

    // Remove client and clear interval on connection close
    req.on('close', () => {
      clearInterval(pingInterval);
      clients.delete(userId);
    });

    // Handle errors
    req.on('error', (error) => {
      console.error('SSE error:', error);
      clearInterval(pingInterval);
      clients.delete(userId);
      res.end();
    });
  } catch (error) {
    console.error('Error in friend request stream:', error);
    clearInterval(pingInterval);
    clients.delete(userId);
    res.end();
  }
}

async function sendFriendRequest(req, res) {
  const { fromUserId, toUserId } = req.body;
  try {
    const newRequest = await FriendService.sendFriendRequest(fromUserId, toUserId);

    // Notify the recipient about the new request
    const recipientClient = clients.get(toUserId.toString());
    if (recipientClient) {
      const pendingRequests = await FriendService.getPendingRequests(toUserId);
      recipientClient.write(`data: ${JSON.stringify({
        type: 'requests',
        data: pendingRequests
      })}\n\n`);
    }

    res.json(newRequest);
  } catch (err) {
    if (err.message.includes('not found')) {
      res.status(404).json({ error: err.message });
    } else if (err.message.includes('already')) {
      res.status(400).json({ error: err.message });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
}

async function getPendingRequests(req, res) {
  const { userId } = req.params;
  try {
    const pendingRequests = await FriendService.getPendingRequests(userId);
    res.json(pendingRequests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function respondToRequest(req, res) {
  const { requestId } = req.params;
  const { accept } = req.body;
  
  try {
    const updatedRequest = await FriendService.respondToFriendRequest(requestId, accept);

    // Notify both users about the updated requests and friend lists
    const recipientClient = clients.get(updatedRequest.toUserId.toString());
    const senderClient = clients.get(updatedRequest.fromUserId.toString());

    if (recipientClient) {
      const pendingRequests = await FriendService.getPendingRequests(updatedRequest.toUserId);
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

    res.json(updatedRequest);
  } catch (err) {
    if (err.message.includes('not found')) {
      res.status(404).json({ error: err.message });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
}

module.exports = { sendFriendRequest, getPendingRequests, respondToRequest, initFriendRequestStream }; 
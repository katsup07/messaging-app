const { messageService } = require('../diContainer');

// Store active SSE clients
const clients = new Map();

// Send keep-alive ping to prevent connection timeout
function sendKeepAlive(res) {
  res.write(': ping\n\n');
}

async function initMessageStream(req, res) {
  const { userId, friendId } = req.params;
  const clientId = `${userId}-${friendId}`;

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
  clients.set(clientId, res);

  // Setup keep-alive ping
  const pingInterval = setInterval(() => sendKeepAlive(res), 30000); // Send ping every 30 seconds

  try {
    // Send initial messages
    const conversationMessages = await messageService.getConversation(userId, friendId);
    res.write(`data: ${JSON.stringify(conversationMessages)}\n\n`);

    // Remove client and clear interval on connection close
    req.on('close', () => {
      clearInterval(pingInterval);
      clients.delete(clientId);
    });

    // Handle errors
    req.on('error', (error) => {
      console.error('SSE error:', error);
      clearInterval(pingInterval);
      clients.delete(clientId);
      res.end();
    });
  } catch (error) {
    console.error('Error in message stream:', error);
    clearInterval(pingInterval);
    clients.delete(clientId);
    res.end();
  }
}

async function getMessages(req, res) {
  const { userId } = req.params;
  const { friendId } = req.query;

  try {
    const conversationMessages = await messageService.getConversation(userId, friendId);
    res.json(conversationMessages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function saveMessage(req, res) {
  try {
    const newMessage = await messageService.saveMessage(req.body);

    // Notify relevant clients about the new message
    const senderId = newMessage.senderId.toString();
    const receiverId = newMessage.receiverId.toString();
    const clientIds = [`${senderId}-${receiverId}`, `${receiverId}-${senderId}`];

    for (const clientId of clientIds) {
      const client = clients.get(clientId);
      if (client) {
        const conversationMessages = await messageService.getConversation(
          senderId,
          receiverId
        );
        client.write(`data: ${JSON.stringify(conversationMessages)}\n\n`);
      }
    }

    res.json(newMessage);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function deleteMessagesBetweenUsers(req, res) {
  const { user1Id, user2Id } = req.params;
  
  try {
    await messageService.deleteMessagesBetweenUsers(user1Id, user2Id);
    
    // Notify clients about the deletion
    const clientIds = [`${user1Id}-${user2Id}`, `${user2Id}-${user1Id}`];
    for (const clientId of clientIds) {
      const client = clients.get(clientId);
      if (client) {
        const conversationMessages = await messageService.getConversation(user1Id, user2Id);
        client.write(`data: ${JSON.stringify(conversationMessages)}\n\n`);
      }
    }
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { getMessages, saveMessage, initMessageStream, deleteMessagesBetweenUsers };
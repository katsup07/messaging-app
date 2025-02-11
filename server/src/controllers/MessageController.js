const FileService = require('../services/FileService');

// Store active SSE clients
const clients = new Map();

async function initMessageStream(req, res) {
  const { userId, friendId } = req.params;
  const clientId = `${userId}-${friendId}`;

  // Set SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });
  res.write('\n');

  // Store the client connection
  clients.set(clientId, res);

  // Send initial messages
  const messages = await FileService.getMessages();
  const conversationMessages = messages.filter(message => 
    (message.senderId.toString() === userId && message.receiverId.toString() === friendId) ||
    (message.senderId.toString() === friendId && message.receiverId.toString() === userId)
  );
  
  res.write(`data: ${JSON.stringify(conversationMessages)}\n\n`);

  // Remove client on connection close
  req.on('close', () => {
    clients.delete(clientId);
  });
}

async function getMessages(req, res) {
  const { userId } = req.params;
  const { friendId } = req.query;

  try {
    const messages = await FileService.getMessages();
    const conversationMessages = messages.filter(message => 
      (message.senderId.toString() === userId && message.receiverId.toString() === friendId) ||
      (message.senderId.toString() === friendId && message.receiverId.toString() === userId)
    );
    res.json(conversationMessages);
  } catch (err) {
    res.status(500).json({ error: 'Failed to read messages' });
  }
}

async function saveMessage(req, res) {
  try {
    const messages = await FileService.getMessages();
    const newMessage = req.body;
    messages.push(newMessage);
    await FileService.saveMessages(messages);

    // Notify relevant clients about the new message
    const senderId = newMessage.senderId.toString();
    const receiverId = newMessage.receiverId.toString();
    const clientIds = [`${senderId}-${receiverId}`, `${receiverId}-${senderId}`];

    clientIds.forEach(clientId => {
      const client = clients.get(clientId);
      if (client) {
        const conversationMessages = messages.filter(message => 
          (message.senderId.toString() === senderId && message.receiverId.toString() === receiverId) ||
          (message.senderId.toString() === receiverId && message.receiverId.toString() === senderId)
        );
        client.write(`data: ${JSON.stringify(conversationMessages)}\n\n`);
      }
    });

    res.json(newMessage);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save message' });
  }
}

module.exports = { getMessages, saveMessage, initMessageStream };
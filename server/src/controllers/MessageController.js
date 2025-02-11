const FileService = require('../services/FileService');

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
    res.json(newMessage);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save message' });
  }
}

module.exports = { getMessages, saveMessage };
const fs = require('fs').promises;
const path = require('path');

const messagesFilePath = path.join(__dirname, '../../data/messages.json');

async function getMessages(req, res) {
  const { userId } = req.params;
  try {
    const data = await fs.readFile(messagesFilePath, 'utf8');
    const messages = JSON.parse(data);
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Failed to read messages' });
  }
}

async function saveMessage(req, res) {
  try {
    const data = await fs.readFile(messagesFilePath, 'utf8');
    const messages = JSON.parse(data);
    const newMessage = req.body;
    messages.push(newMessage);
    await fs.writeFile(messagesFilePath, JSON.stringify(messages, null, 2));
    res.json(newMessage);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save message' });
  }
}

module.exports = { getMessages, saveMessage };
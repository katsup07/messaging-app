const fs = require('fs').promises;
const path = require('path');

const messagesFilePath = path.join(__dirname, '../../data/messages.json');

async function getMessages(_, res) {
  console.log('Getting messages...');
  try {
    const data = await fs.readFile(messagesFilePath, 'utf8');
    console.log('User retrieved: ', data);
    res.json(JSON.parse(data));
  } catch (err) {
    res.status(500).json({ error: 'Failed to read user' });
  }
}

async function saveMessage(req, res) {
  console.log('Saving message...');
  const newMessage = req.body;

  try {
    const data = await fs.readFile(messagesFilePath, 'utf8');
    const messages = JSON.parse(data);
    messages.push(newMessage);

    await fs.writeFile(messagesFilePath, JSON.stringify(messages, null, 2));
    res.status(201).json(newMessage);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save message' });
  }
}

module.exports = { getMessages, saveMessage };
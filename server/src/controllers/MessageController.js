const { messageService } = require('../diContainer');
const { socketIoController } = require('../../providers/socketioController');

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
    const { senderId, sender, receiverId, content, 
      time, isRead
       } = newMessage;
    const io = socketIoController.getIO();
    const message = {
      senderId,
      sender,
      receiverId,
      content,
      time,
      isRead
    };
    io.to(`user_${req.body.receiverId}`).emit('receive-message', { message });
    res.json(newMessage);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function deleteMessagesBetweenUsers(req, res) {
  const { user1Id, user2Id } = req.params;
  
  // Authorization check - ensure user can only delete their own messages
  if (req.user.userId.toString() !== user1Id.toString() && 
      req.user.userId.toString() !== user2Id.toString()) {
    return res.status(403).json({ error: 'Unauthorized attempt to delete messages' });
  }
  
  try {
    await messageService.deleteMessagesBetweenUsers(user1Id, user2Id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { getMessages, saveMessage, deleteMessagesBetweenUsers };
const fs = require('fs').promises;
const path = require('path');

class FileService {
  constructor() {
    this.dataPath = path.join(__dirname, '../../data');
    this.paths = {
      messages: path.join(this.dataPath, 'messages.json'),
      auth: path.join(this.dataPath, 'auth.json'),
      friends: path.join(this.dataPath, 'friends.json')
    };
  }

  async readJsonFile(filePath) {
    try {
      const data = await fs.readFile(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      throw new Error(`Failed to read file: ${error.message}`);
    }
  }

  async writeJsonFile(filePath, data) {
    try {
      await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
      throw new Error(`Failed to write file: ${error.message}`);
    }
  }

  // Helper methods for specific data files
  async getMessages() {
    return this.readJsonFile(this.paths.messages);
  }

  async saveMessages(messages) {
    return this.writeJsonFile(this.paths.messages, messages);
  }

  async getUsers() {
    return this.readJsonFile(this.paths.auth);
  }

  async getFriends() {
    return this.readJsonFile(this.paths.friends);
  }
}

module.exports = new FileService(); 
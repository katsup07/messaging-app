const fs = require('fs').promises;
const path = require('path');

class FileService {
  constructor() {
    this.dataPath = path.join(__dirname, '../../data');
    this.paths = {
      messages: path.join(this.dataPath, 'messages.json'),
      auth: path.join(this.dataPath, 'auth.json'),
      friends: path.join(this.dataPath, 'friends.json'),
      friendRequests: path.join(this.dataPath, 'friendRequests.json')
    };
    this.initializeFiles();
  }

  async initializeFiles() {
    try {
      await this.ensureFileExists(this.paths.messages, '[]');
      await this.ensureFileExists(this.paths.auth, '[]');
      await this.ensureFileExists(this.paths.friends, '[]');
      await this.ensureFileExists(this.paths.friendRequests, '[]');
    } catch (error) {
      console.error('Error initializing files:', error);
    }
  }

  async ensureFileExists(filePath, defaultContent) {
    try {
      await fs.access(filePath);
      // Check if file is empty
      const stats = await fs.stat(filePath);
      if (stats.size === 0) {
        await fs.writeFile(filePath, defaultContent, 'utf8');
      }
    } catch (error) {
      // File doesn't exist, create it
      await fs.writeFile(filePath, defaultContent, 'utf8');
    }
  }

  async readJsonFile(filePath) {
    try {
      const data = await fs.readFile(filePath, 'utf8');
      if (!data.trim()) {
        // If file is empty or only whitespace, return empty array
        return [];
      }
      return JSON.parse(data);
    } catch (error) {
      if (error instanceof SyntaxError) {
        console.error(`Invalid JSON in file ${filePath}:`, error);
        // Return empty array for invalid JSON
        return [];
      }
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

  async saveUsers(users) {
    return this.writeJsonFile(this.paths.auth, users);
  }

  async getFriendRequests() {
    return this.readJsonFile(this.paths.friendRequests);
  }

  async saveFriendRequests(requests) {
    return this.writeJsonFile(this.paths.friendRequests, requests);
  }

  async saveFriends(friends) {
    return this.writeJsonFile(this.paths.friends, friends);
  }
}

module.exports = new FileService(); 
/**
 * BaseMessageRepository - Abstract base class defining the contract for message repositories
 * This class serves as an interface-like contract between application and repository layers
 */
class BaseMessageRepository {
  /**
   * Gets the messages MongoDB collection
   * @returns {Promise<Collection>} The MongoDB collection for messages
   */
  async getMessageCollection() {
    throw new Error('Method getMessageCollection must be implemented');
  }

  /**
   * Gets all messages from the database
   * @returns {Promise<Array>} Array of message objects
   */
  async getMessages() {
    throw new Error('Method getMessages must be implemented');
  }

  /**
   * Gets messages exchanged between two users
   * @param {string} userId - ID of the first user
   * @param {string} friendId - ID of the second user
   * @returns {Promise<Array>} Array of message objects
   */
  async getMessagesBetweenUsers(userId, friendId) {
    throw new Error('Method getMessagesBetweenUsers must be implemented');
  }

  /**
   * Saves a new message to the database
   * @param {Object} message - The message object to save
   * @returns {Promise<Object>} The saved message with generated ID
   */
  async saveMessage(message) {
    throw new Error('Method saveMessage must be implemented');
  }

  /**
   * Finds a message by its ID
   * @param {string} id - The message ID to find
   * @returns {Promise<Object|null>} The message object or null if not found
   */
  async findById(id) {
    throw new Error('Method findById must be implemented');
  }

  /**
   * Creates database indexes for optimizing message queries
   * @returns {Promise<void>}
   */
  async _createIndexes() {
    throw new Error('Method _createIndexes must be implemented');
  }
}

module.exports = BaseMessageRepository;
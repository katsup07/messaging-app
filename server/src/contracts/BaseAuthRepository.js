/**
 * BaseAuthRepository - Abstract base class defining the contract for auth repositories
 * This class serves as an interface-like contract between application and repository layers
 */
class BaseAuthRepository {
  /**
   * Gets the users MongoDB collection
   * @returns {Promise<Collection>} The MongoDB collection for users
   */
  async getUsersCollection() {
    throw new Error('Method getUsersCollection must be implemented');
  }

  /**
   * Gets all users from the database
   * @returns {Promise<Array>} Array of user objects
   */
  async getUsers() {
    throw new Error('Method getUsers must be implemented');
  }

  /**
   * Saves a new user to the database
   * @param {Object} user - The user object to save
   * @returns {Promise<Object>} The saved user with generated ID
   */
  async saveUser(user) {
    throw new Error('Method saveUser must be implemented');
  }

  /**
   * Updates an existing user in the database
   * @param {Object} params - Update parameters
   * @param {string} params.userId - ID of the user to update
   * @param {Object} params.updateFields - Fields to update
   * @returns {Promise<Object>} The updated user object
   */
  async updateUser({userId, updateFields}) {
    throw new Error('Method updateUser must be implemented');
  }

  /**
   * Finds a user by their ID
   * @param {string} id - The user ID to find
   * @returns {Promise<Object|null>} The user object or null if not found
   */
  async findById(id) {
    throw new Error('Method findById must be implemented');
  }

  /**
   * Finds a user by their email address
   * @param {string} email - The email to search for
   * @returns {Promise<Object|null>} The user object or null if not found
   */
  async findByEmail(email) {
    throw new Error('Method findByEmail must be implemented');
  }
}

module.exports = BaseAuthRepository;
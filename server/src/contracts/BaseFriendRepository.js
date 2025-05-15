/**
 * BaseFriendRepository - Abstract base class defining the contract for friend repositories
 * This class serves as an interface-like contract between application and repository layers
 */
class BaseFriendRepository {
  /**
   * Gets the friend requests MongoDB collection
   * @returns {Promise<Collection>} The MongoDB collection for friend requests
   */
  async getFriendRequestsCollection() {
    throw new Error('Method getFriendRequestsCollection must be implemented');
  }

  /**
   * Gets the friends MongoDB collection
   * @returns {Promise<Collection>} The MongoDB collection for friends
   */
  async getFriendsCollection() {
    throw new Error('Method getFriendsCollection must be implemented');
  }

  /**
   * Gets all friend requests from the database
   * @returns {Promise<Array>} Array of friend request objects
   */
  async getFriendRequests() {
    throw new Error('Method getFriendRequests must be implemented');
  }

  /**
   * Saves multiple friend requests to the database
   * @param {Array} friendRequests - Array of friend request objects to save
   * @returns {Promise<Array>} Array of generated friend request IDs
   */
  async saveFriendRequests(friendRequests) {
    throw new Error('Method saveFriendRequests must be implemented');
  }

  /**
   * Finds a friend request by ID
   * @param {string} id - The friend request ID to find
   * @returns {Promise<Object|null>} The friend request or null if not found
   */
  async findById(id) {
    throw new Error('Method findById must be implemented');
  }

  /**
   * Saves multiple friends to the database
   * @param {Array} friends - Array of friend objects to save
   * @returns {Promise<Array>} Array of generated friend IDs
   */
  async saveFriends(friends) {
    throw new Error('Method saveFriends must be implemented');
  }

  /**
   * Updates user data in all friend lists where the user appears
   * @param {string} friendId - ID of the user whose data needs updating
   * @param {Object} updateFields - The fields to update
   * @returns {Promise<Object>} Result of the update operation
   */
  async updateUserDataInAllFriendsLists(friendId, updateFields) {
    throw new Error('Method updateUserDataInAllFriendsLists must be implemented');
  }

  /**
   * Gets all friends from the database
   * @returns {Promise<Array>} Array of friend list objects
   */
  async getFriends() {
    throw new Error('Method getFriends must be implemented');
  }

  /**
   * Clears the friends collection
   * @returns {Promise<boolean>} True if successful
   */
  async clearFriendsCollection() {
    throw new Error('Method clearFriendsCollection must be implemented');
  }

  /**
   * Checks if two users are friends
   * @param {string} userId - First user ID
   * @param {string} friendId - Second user ID
   * @returns {Promise<boolean>} True if the users are friends
   */
  async areFriends(userId, friendId) {
    throw new Error('Method areFriends must be implemented');
  }

  /**
   * Inserts a new friend request
   * @param {Object} request - The friend request to insert
   * @returns {Promise<Object>} The inserted friend request
   */
  async insertFriendRequest(request) {
    throw new Error('Method insertFriendRequest must be implemented');
  }

  /**
   * Updates an existing friend request
   * @param {string} requestId - ID of the request to update
   * @param {Object} updateFields - Fields to update
   * @returns {Promise<Object>} The updated friend request
   */
  async updateFriendRequest(requestId, updateFields) {
    throw new Error('Method updateFriendRequest must be implemented');
  }

  /**
   * Finds a pending friend request between two users
   * @param {string} fromUserId - ID of the request sender
   * @param {string} toUserId - ID of the request recipient
   * @returns {Promise<Object|null>} The friend request or null if not found
   */
  async findPendingRequest(fromUserId, toUserId) {
    throw new Error('Method findPendingRequest must be implemented');
  }

  /**
   * Finds a friend request by its ID
   * @param {string} requestId - ID of the friend request to find
   * @returns {Promise<Object|null>} The friend request or null if not found
   */
  async findFriendRequestById(requestId) {
    throw new Error('Method findFriendRequestById must be implemented');
  }

  /**
   * Updates or creates a friendship between two users
   * @param {string} userId - ID of the first user
   * @param {string} username - Username of the first user
   * @param {Object} friendData - Data of the friend to add
   * @returns {Promise<void>}
   */
  async updateOrCreateFriendship(userId, username, friendData) {
    throw new Error('Method updateOrCreateFriendship must be implemented');
  }
}

module.exports = BaseFriendRepository;
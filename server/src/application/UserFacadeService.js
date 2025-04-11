// A service for coordinating user-related operations, such as updating in multiple other services. A service layer that makes use of other services.
class UserFacadeService{
  constructor(authService, friendService) {
    this.authService = authService;
    this.friendService = friendService;
  }

  async updateUserDetailsInFriendsLists(userId, updateData) {
    try {
      const updateFields = {};
      if (updateData.username) updateFields.username = updateData.username;
      if (updateData.email) updateFields.email = updateData.email;
      
      if (Object.keys(updateFields).length === 0)
        return { success: true, message: "No friend list fields to update" };
      
      return await this.friendService.updateUserDataInFriendsLists(userId, updateFields);
    } catch (error) {
      throw new Error(`Update failed: ${error.message}`);
    }
  }
}

module.exports = UserFacadeService;
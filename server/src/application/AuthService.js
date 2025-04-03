
// TODO: Decide whether both _id and id are needed in the user object
// TODO: Use jwt and decrypt the password before saving it to the database
class AuthService {
  constructor(authRepository) {
    this.authRepository = authRepository;
    this.authRepository = authRepository;
  }

  async signup(email, password){
    try {
      const users = await this.authRepository.getUsers();
      const existingUser = users.find(user => user.email === email);

      if (existingUser){
        console.log('Email already in use:', email);
        throw new Error('Email already in use');
      }

      const newUser = {
        id: `${Date.now()}`,
        username: email.split('@')[0],
        email,
        password,
        isLoggedIn: false
      };

      await this.authRepository.saveUser(newUser);

      return await this.login(email, password);
    } catch (error) {
      throw new Error(`Signup failed: ${error.message}`);
    }
  }
 // TODO: Use jwt and decrypt the password before saving it to the database
  async login(email, password) {
    console.log('Logging in...')
    try {
      const user = await this.authRepository.findByEmail(email);

      if (!user || user.email !== email)
        throw new Error('Invalid credentials');

      user.isLoggedIn = true;
      const updatedUser = await this.authRepository.updateUser({userId: user._id, updateFields: { isLoggedIn: true} });
      return updatedUser;
    } catch (error) {
      throw new Error(`Login failed: ${error.message}`);
    }
  }

  // TODO: Fix so that logged out user data is properly updated in the database. It only updates the user object in memory, not in the database currently.
  async logout(userId) {
    try {
      const user = await this.authRepository.findById(userId);
      
      if (!user)
        throw new Error('User not found');

      user.isLoggedIn = false;
      await this.authRepository.updateUser({userId: user._id, updateFields: { isLoggedIn: false} });
      return true;
    } catch (error) {
      throw new Error(`Logout failed: ${error.message}`);
    }
  }

  async getAllUsers() {
    try {
      return await this.authRepository.getUsers();
    } catch (error) {
      throw new Error(`Failed to get users: ${error.message}`);
    }
  }

  async getUserById(userId) {
    try {
      const users = await this.authRepository.getUsers();
      const user = users.find(u => u.id.toString() === userId.toString());
      
      if (!user) {
        throw new Error('User not found');
      }

      return user;
    } catch (error) {
      throw new Error(`Failed to get user: ${error.message}`);
    }
  }

  async validateUser(userId) {
    try {
      const user = await this.getUserById(userId);
      return user.isLoggedIn === true;
    } catch (error) {
      return false;
    }
  }
}

module.exports = AuthService;
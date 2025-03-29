const DataRepository = require('../repositories/DataRepository');

class AuthService {
  constructor(dataRepository) {
    this.dataRepository = dataRepository;
  }

  async signup(email, password){
    try {
      const users = await this.dataRepository.getUsers();
      const existingUser = users.find(user => user.email === email);

      if (existingUser)
        throw new Error('Email already in use');

      const newUser = {
        id: `${Date.now()}`,
        username: email.split('@')[0],
        email,
        password,
        isLoggedIn: false
      };

      users.push(newUser);
      await this.dataRepository.saveUsers(users);

      return await this.login(email, password);
    } catch (error) {
      throw new Error(`Signup failed: ${error.message}`);
    }
  }

  async login(email, password) {
    try {
      const users = await this.dataRepository.getUsers();
      const user = users.find((user) => 
        user.email === email &&
        user.password === password
      );

      if (!user)
        throw new Error('Invalid credentials');

      user.isLoggedIn = true;
      await this.dataRepository.saveUsers(users);
      return user;
    } catch (error) {
      throw new Error(`Login failed: ${error.message}`);
    }
  }

  async logout(userId) {
    try {
      const users = await this.dataRepository.getUsers();
      const user = users.find(u => u.id.toString() === userId.toString());
      
      if (!user) {
        throw new Error('User not found');
      }

      user.isLoggedIn = false;
      await this.dataRepository.saveUsers(users);
      return true;
    } catch (error) {
      throw new Error(`Logout failed: ${error.message}`);
    }
  }

  async getAllUsers() {
    try {
      return await this.dataRepository.getUsers();
    } catch (error) {
      throw new Error(`Failed to get users: ${error.message}`);
    }
  }

  async getUserById(userId) {
    try {
      const users = await this.dataRepository.getUsers();
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
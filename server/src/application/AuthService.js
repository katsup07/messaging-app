
const bcrypt = require('bcrypt');

// TODO: Fix error messages to be more user-friendly on client-side, like "Invalid email or password"
// TODO: Decide whether both _id and id are needed in the user object
// TODO: Use jwt and decrypt the password before saving it to the database
class AuthService {
  constructor(authRepository) {
    this.authRepository = authRepository;
    this.saltRounds = 10; // Rounds for password hashing
  }

  async signup(email, password){
    try {
      const validation = this._validatePasswordStrength(password);
      if(!validation.isValid)
         throw new Error(validation.message);

      const existingUser = await this.authRepository.findByEmail(email);
      if (existingUser)
        throw new Error('Email already in use');

      const passwordHash = await bcrypt.hash(password, this.saltRounds);

      const newUser = {
        id: `${Date.now()}`,
        username: email.split('@')[0],
        email,
        passwordHash,
        isLoggedIn: false
      };

      await this.authRepository.saveUser(newUser);

      return await this.login(email, password);
    } catch (error) {
      throw new Error(`Signup failed: ${error.message}`);
    }
  }

  async login(email, password) {
    try {
      const user = await this.authRepository.findByEmail(email);

      if (!user || user.email !== email)
        throw new Error('Invalid credentials');

      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid)
        throw new Error('Invalid credentials');

      user.isLoggedIn = true;
      const updatedUser = await this.authRepository.updateUser({userId: user._id, updateFields: { isLoggedIn: true} });

      const { passwordHash, ...userWithoutPasswordHash } = updatedUser;
      return userWithoutPasswordHash;
    } catch (error) {
      throw new Error(`Login failed: ${error.message}`);
    }
  }

  async logout(userId) {
    try {
      const user = await this.authRepository.findById(userId);
      
      if (!user)
        throw new Error('User not found');

      user.isLoggedIn = false;
      await this.authRepository.updateUser({userId, updateFields: { isLoggedIn: false} });
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

  // private helper
  _validatePasswordStrength(password) {
    // Minimum 8 characters
    if (password.length < 8)
      return { isValid: false, message: 'Password must be at least 8 characters' };

    // Require uppercase letters
    if (!/[A-Z]/.test(password))
      return { isValid: false, message: 'Password must contain at least one uppercase letter' };

    // Require lowercase letters
    if (!/[a-z]/.test(password))
      return { isValid: false, message: 'Password must contain at least one lowercase letter' };

    // Require numbers
    if (!/[0-9]/.test(password))
      return { isValid: false, message: 'Password must contain at least one number' };

    // Require special characters
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password))
      return { isValid: false, message: 'Password must contain at least one special character' };

    return { isValid: true };
  }
}

module.exports = AuthService;
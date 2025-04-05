const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET
const JWT_EXPIRATION = process.env.JWT_EXPIRES_IN || '1h';

// TODO: Check for auth token upon every request. Add middleware to check for token in headers and validate it.
class AuthService {
  constructor(authRepository) {
    this.authRepository = authRepository;
    this.saltRounds = 10; // Rounds for password hashing
  }

  async verifyToken(token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await this.authRepository.findById(decoded.id);
      if (!user) return null;
  
      return { userId: user._id };
    } catch (error) {
      return null;
    }
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
        username: email.split('@')[0],
        email,
        passwordHash
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
  
      const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRATION });

      const { passwordHash, ...userWithoutPasswordHash } = user;
      return { user: userWithoutPasswordHash, token };
    } catch (error) {
      throw new Error(`Login failed: ${error.message}`);
    }
  }

  async logout(userId) {
    try {
      const user = await this.authRepository.findById(userId);
      
      if (!user)
        throw new Error('User not found');

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
      const user = await this.authRepository.findById(userId);

      if (!user)
        throw new Error('User not found');
      
      return user;
    } catch (error) {
      throw new Error(`Failed to get user: ${error.message}`);
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
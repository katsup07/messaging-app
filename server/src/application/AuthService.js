const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { logError, logInfo } = require('../middleware/logger');

const JWT_SECRET = process.env.JWT_SECRET
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
const REFRESH_TOKEN_EXPIRATION = process.env.REFRESH_TOKEN_EXPIRATION;
const ACCESS_TOKEN_EXPIRATION = process.env.ACCESS_TOKEN_EXPIRATION;

class AuthService {
  constructor(authRepository) {
    this.authRepository = authRepository;
    this.saltRounds = 10; // Rounds for password hashing
    
    // Log environment variables for debugging (excluding the actual secrets)
    logInfo(`JWT_SECRET set: ${!!JWT_SECRET}`);
    logInfo(`REFRESH_TOKEN_SECRET set: ${!!REFRESH_TOKEN_SECRET}`);
    logInfo(`ACCESS_TOKEN_EXPIRATION: ${ACCESS_TOKEN_EXPIRATION}`);
    logInfo(`REFRESH_TOKEN_EXPIRATION: ${REFRESH_TOKEN_EXPIRATION}`);
  }

  async refreshToken(refreshToken) {
    try{
      const decodedRefreshToken = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET); // throws error if token is expired or invalid
      const user = await this.authRepository.findById(decodedRefreshToken.id);
      if (!user) return null;

      // Check to ensure token has not been invalidated via token version
      const isTokenValid = decodedRefreshToken.tokenVersion === user.tokenVersion;
      if (!isTokenValid) return null;

      const { accessToken: newAccessToken, refreshToken: newRefreshToken } = await this._generateTokens(user);

      return { newAccessToken, newRefreshToken };
    }catch(error){
      logError('Token refresh error:', error);
      return null;
    }
  }

  async verifyToken(accessToken) {
    try {
      const decodedAccessToken = jwt.verify(accessToken, JWT_SECRET); // throws error if token is expired or invalid
      const user = await this.authRepository.findById(decodedAccessToken.id);
      
      if (!user) return null;

      // Check to ensure token has not been invalidated via token version
      const isTokenValid = decodedAccessToken.tokenVersion === user.tokenVersion;
      if (!isTokenValid) return null;
     
      return { isValid: true, userId: user._id, error: null };
    } catch (error) {
      logError('Token verification error: ', error.message);
      return { isValid: false, error: error.message };
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
        passwordHash,
        tokenVersion: 0, // initialize token
      };

      await this.authRepository.saveUser(newUser);

      return await this.login(email, password);
    } catch (error) {
      throw new Error(`Signup failed: ${error.message}`);
    }
  }

  async login(email, password) {
    try {
      logInfo(`AuthService.login: Finding user with email: ${email}`);
      const user = await this.authRepository.findByEmail(email);

      if (!user || user.email !== email) {
        logInfo('AuthService.login: User not found or email mismatch');
        throw new Error('Invalid credentials');
      }

      logInfo('AuthService.login: User found, comparing password');
      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) {
        logInfo('AuthService.login: Password invalid');
        throw new Error('Invalid credentials');
      }
  
      logInfo('AuthService.login: Password valid, generating tokens');
      const { accessToken, refreshToken } = await this._generateTokens(user);

      const { passwordHash, ...userWithoutPasswordHash } = user;
      logInfo('AuthService.login: Login successful');
      return { user: userWithoutPasswordHash, accessToken, refreshToken };
    } catch (error) {
      logError(`AuthService.login error: ${error.message}`);
      throw new Error(`Login failed: ${error.message}`);
    }
  }

  async _generateTokens(user) {
    const accessToken = jwt.sign(
      { id: user._id, tokenVersion: user.tokenVersion }, 
      JWT_SECRET, 
      { expiresIn: ACCESS_TOKEN_EXPIRATION 
      });
    
    const refreshToken = jwt.sign(
      { id: user._id, tokenVersion: user.tokenVersion },
      REFRESH_TOKEN_SECRET,
      { expiresIn: REFRESH_TOKEN_EXPIRATION }
    );

    return { accessToken, refreshToken };
  }

  async logout(userId) {
    try {
      const user = await this.authRepository.findById(userId);
      
      if (!user)
        throw new Error('User not found');
     
      this._invalidateToken(user);

      return true;
    } catch (error) {
      throw new Error(`Logout failed: ${error.message}`);
    }
  }

  _invalidateToken = async (user) => {
    const newTokenVersion = (user.tokenVersion || 0) + 1;
    await this.authRepository.updateUser(
      { userId: user._id, 
        updateFields: { tokenVersion: newTokenVersion } 
      });
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
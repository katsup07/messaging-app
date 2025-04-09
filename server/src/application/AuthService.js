const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { logError } = require('../middleware/logger');

const JWT_SECRET = process.env.JWT_SECRET
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
const REFRESH_TOKEN_EXPIRATION = process.env.REFRESH_TOKEN_EXPIRATION;
const ACCESS_TOKEN_EXPIRATION = process.env.ACCESS_TOKEN_EXPIRATION;

class AuthService {
  constructor(authRepository) {
    this.authRepository = authRepository;
    this.saltRounds = 10; // Rounds for password hashing
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
      const user = await this.authRepository.findByEmail(email);

      if (!user || user.email !== email)
        throw new Error('Invalid credentials');

      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid)
        throw new Error('Invalid credentials');
  
      const { accessToken, refreshToken } = await this._generateTokens(user);

      const { passwordHash, ...userWithoutPasswordHash } = user;
      return { user: userWithoutPasswordHash, accessToken, refreshToken };
    } catch (error) {
      throw new Error(`Login failed: ${error.message}`);
    }
  }

 async _generateTokens(user){
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

  async updateUserDetails(userId, updateData) {
    try {
      // Check if user exists
      const existingUser = await this.authRepository.findById(userId);
      if (!existingUser) {
        throw new Error('User not found');
      }

      // Check if email is taken by another user
      if (updateData.email !== existingUser.email) {
        const emailTaken = await this.authRepository.findByEmail(updateData.email);
        if (emailTaken && emailTaken._id.toString() !== userId.toString()) {
          throw new Error('Email is already in use by another account');
        }
      }

      // Prepare update fields (always update username and email)
      const updateFields = {
        username: updateData.username,
        email: updateData.email
      };
      // Handle password update if provided
      if (updateData.password) 
        updateFields.passwordHash = await bcrypt.hash(updateData.password, this.saltRounds);

      const updatedUser = await this.authRepository.updateUser({ userId, updateFields });
      
      const { passwordHash, ...userWithoutPasswordHash } = updatedUser;
      return userWithoutPasswordHash;
    } catch (error) {
      throw new Error(`Update failed: ${error.message}`);
    }
  }
}

module.exports = AuthService;
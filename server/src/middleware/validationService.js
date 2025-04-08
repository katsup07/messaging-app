const { z } = require('zod');
const { logInfo } = require('./logger');

class ValidationService {
  constructor() {
    // Auth Schemas
    this.loginAndSignupSchema = z.object({
      email: z.string().email('Invalid email format'),
      password: z.string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number')
        .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, 'Password must contain at least one special character')
    });

    this.refreshTokenSchema = z.object({
      refreshToken: z.string().min(1, 'Refresh token is required')
    });

    // Message Schemas
    this.messageSchema = z.object({
      senderId: z.string().or(z.number()).optional(),
      receiverId: z.string().or(z.number()).optional(),
      content: z.string().min(1, 'Message content cannot be empty'),
      time: z.string().optional(),
      receiver: z.object({
        _id: z.string().or(z.number()),
        username: z.string().optional(),
        email: z.string().email().optional()
      })
    });

    // Friend Request Schemas
    this.friendRequestSchema = z.object({
      fromUserId: z.string().or(z.number()),
      toUserId: z.string().or(z.number()),
    });

    this.friendRequestResponseSchema = z.object({
      accept: z.boolean()
    });
  }

  /**
   * Validate data against a schema
   * @param {Object} data - The data to validate
   * @param {z.ZodObject} schema - The schema to validate against
   * @returns {Object} - Result object with success flag and errors or validated data
   */
  validate(data, schema) {
    try {
      const validatedData = schema.parse(data);
      return { success: true, data: validatedData };
    } catch (error) {
      const formattedErrors = error.errors.map(err => ({
        path: err.path.join('.'),
        message: err.message
      }));
      
      return {
        success: false,
        errors: formattedErrors
      };
    }
  }

  /**
   * Middleware to validate request body
   * @param {z.ZodObject} schema - The schema to validate against
   * @returns {Function} - Express middleware
   */
  validateBody(schema) {
    return (req, res, next) => {
      const result = this.validate(req.body, schema);
      
      if (!result.success) {
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: result.errors 
        });
      }
      logInfo(`Request body validation passed for ${req.path}`);
      // Add validated data to request
      req.validatedBody = result.data;
      next();
    };
  }

  // Validation methods for different routes
  validateLogin() {
    return this.validateBody(this.loginAndSignupSchema);
  }

  validateSignup() {
    return this.validateBody(this.loginAndSignupSchema);
  }

  validateRefreshToken() {
    return this.validateBody(this.refreshTokenSchema);
  }

  validateMessage() {
    return this.validateBody(this.messageSchema);
  }

  validateFriendRequest() {
    return this.validateBody(this.friendRequestSchema);
  }

  validateFriendRequestResponse() {
    return this.validateBody(this.friendRequestResponseSchema);
  }

  /**
   * Validate query parameters
   * @param {z.ZodObject} schema - The schema to validate against
   * @returns {Function} - Express middleware
   */
  validateQuery(schema) {
    return (req, res, next) => {
      const result = this.validate(req.query, schema);
      
      if (!result.success) {
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: result.errors 
        });
      }
      
      req.validatedQuery = result.data;
      next();
    };
  }

  /**
   * Validate params
   * @param {z.ZodObject} schema - The schema to validate against
   * @returns {Function} - Express middleware
   */
  validateParams(schema) {
    return (req, res, next) => {
      const result = this.validate(req.params, schema);
      
      if (!result.success) {
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: result.errors 
        });
      }

      req.validatedParams = result.data;
      next();
    };
  }
}

module.exports = new ValidationService();
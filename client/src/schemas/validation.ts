import { z } from 'zod';

// Auth schema
export const loginAndSignupSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email format'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/, 'Password must contain at least one special character')
});

// User settings schema
export const userSettingsSchema = z.object({
  username: z
    .string()
    .min(1, 'Username is required')
    .max(50, 'Username must be less than 50 characters'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email format'),
  password: z
    .string()
    .optional()
    .refine((val) => !val || val.length >= 8, {
      message: 'Password must be at least 8 characters'
    })
    .refine((val) => !val || /[A-Z]/.test(val), {
      message: 'Password must contain at least one uppercase letter'
    })
    .refine((val) => !val || /[a-z]/.test(val), {
      message: 'Password must contain at least one lowercase letter'
    })
    .refine((val) => !val || /[0-9]/.test(val), {
      message: 'Password must contain at least one number'
    })
    .refine((val) => !val || /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(val), {
      message: 'Password must contain at least one special character'
    }),
  confirmPassword: z.string().optional()
}).refine((data) => {
  if (data.password && data.confirmPassword) {
    return data.password === data.confirmPassword;
  }
  return true;
}, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});

// Friend request schema - matching server friendRequestSchema
export const addFriendSchema = z.object({
  fromUserId: z.string().or(z.number()),
  toUserId: z.string().or(z.number())
});

// Simple friend ID validation for UI components
export const friendIdSchema = z.object({
  friendId: z
    .string()
    .min(1, 'Friend ID is required')
    .regex(/^[a-fA-F0-9]{24}$/, 'Invalid Friend ID')
});

// Message schema - matching server messageSchema
export const messageSchema = z.object({
  senderId: z.string().or(z.number()).optional(),
  receiverId: z.string().or(z.number()).optional(),
  content: z.string().min(1, 'Message content cannot be empty').max(1000, 'Message must be less than 1000 characters'),
  time: z.string().optional(),
  receiver: z.object({
    _id: z.string().or(z.number()),
    username: z.string().optional(),
    email: z.string().email().optional()
  }).optional()
});

// Simple message content validation for UI components
export const messageContentSchema = z.object({
  content: z
    .string()
    .min(1, 'Message cannot be empty')
    .max(1000, 'Message must be less than 1000 characters')
});

// Friend request response schema - matching server friendRequestResponseSchema
export const friendRequestResponseSchema = z.object({
  accept: z.boolean()
});

// Type exports for TypeScript
export type LoginAndSignupForm = z.infer<typeof loginAndSignupSchema>;
export type UserSettingsForm = z.infer<typeof userSettingsSchema>;
export type AddFriendForm = z.infer<typeof addFriendSchema>;
export type FriendIdForm = z.infer<typeof friendIdSchema>;
export type MessageForm = z.infer<typeof messageSchema>;
export type MessageContentForm = z.infer<typeof messageContentSchema>;
export type FriendRequestResponseForm = z.infer<typeof friendRequestResponseSchema>;

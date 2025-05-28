import { ZodError } from 'zod';

/**
 * Extract error message from Zod validation error
 * @param error - The error object from try-catch
 * @returns The first validation error message or a default message
 */
export const extractValidationError = (error: unknown): string => {
  if (error instanceof ZodError) {
    return error.errors[0]?.message || 'Validation error';
  }
  
  if (error && typeof error === 'object' && 'errors' in error) {
    const zodError = error as { errors: Array<{ message: string }> };
    return zodError.errors?.[0]?.message || 'Validation error';
  }
  
  return 'Validation error';
};
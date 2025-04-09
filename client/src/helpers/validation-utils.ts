export const validateUsername = (username: string): boolean => {
  return username.length >= 3;
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

interface ValidationResult {
  isValid: boolean;
  message?: string;
}

export const validatePassword = (password: string): ValidationResult => {
  // Minimum 8 characters
  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters' };
  }

  // Require uppercase letters
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter' };
  }

  // Require lowercase letters
  if (!/[a-z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one lowercase letter' };
  }

  // Require numbers
  if (!/[0-9]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one number' };
  }

  // Require special characters
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one special character' };
  }

  return { isValid: true };
}
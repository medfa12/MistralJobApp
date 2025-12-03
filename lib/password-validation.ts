export interface PasswordValidationResult {
  valid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong' | 'very-strong';
  score: number;
}

export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];
  let score = 0;

  // Length check
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  } else {
    score = 100;
  }

  // Calculate strength
  let strength: 'weak' | 'medium' | 'strong' | 'very-strong';
  
  if (password.length < 8) strength = 'weak';
  else if (password.length < 10) strength = 'medium';
  else if (password.length < 12) strength = 'strong';
  else strength = 'very-strong';

  return {
    valid: errors.length === 0,
    errors,
    strength,
    score
  };
}

/**
 * Validates password with context-specific requirements
 * @param password - The password to validate
 * @param context - Additional validation context
 */
export function validatePasswordWithContext(
  password: string,
  context?: {
    email?: string;
    firstName?: string;
    lastName?: string;
  }
): PasswordValidationResult {
  const baseValidation = validatePassword(password);
  
  if (!context) {
    return baseValidation;
  }

  const errors = [...baseValidation.errors];
  let score = baseValidation.score;

  // Check if password contains parts of email, username, or name
  const lowerPassword = password.toLowerCase();
  
  if (context.email) {
    const emailParts = context.email.toLowerCase().split('@')[0];
    if (lowerPassword.includes(emailParts) && emailParts.length > 3) {
      errors.push('Password should not contain parts of your email address');
      score -= 15;
    }
  }

  if (context.firstName && context.firstName.length > 2) {
    if (lowerPassword.includes(context.firstName.toLowerCase())) {
      errors.push('Password should not contain your first name');
      score -= 10;
    }
  }

  if (context.lastName && context.lastName.length > 2) {
    if (lowerPassword.includes(context.lastName.toLowerCase())) {
      errors.push('Password should not contain your last name');
      score -= 10;
    }
  }

  // Recalculate strength
  const finalScore = Math.max(0, Math.min(100, score));
  let strength: 'weak' | 'medium' | 'strong' | 'very-strong';
  
  if (finalScore < 40) strength = 'weak';
  else if (finalScore < 60) strength = 'medium';
  else if (finalScore < 80) strength = 'strong';
  else strength = 'very-strong';

  return {
    valid: errors.length === 0,
    errors,
    strength,
    score: finalScore
  };
}

/**
 * Gets a human-readable description of password strength
 */
export function getPasswordStrengthDescription(strength: PasswordValidationResult['strength']): string {
  switch (strength) {
    case 'weak':
      return 'Weak - Not recommended';
    case 'medium':
      return 'Medium - Could be stronger';
    case 'strong':
      return 'Strong - Good password';
    case 'very-strong':
      return 'Very Strong - Excellent password!';
  }
}

/**
 * Generates a suggested strong password
 */
export function generateStrongPassword(length: number = 16): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  
  const allChars = uppercase + lowercase + numbers + special;
  
  let password = '';
  
  // Ensure at least one of each type
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];
  
  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}


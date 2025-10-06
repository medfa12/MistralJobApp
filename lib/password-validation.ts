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
  if (password.length < 12) {
    errors.push('Password must be at least 12 characters long');
  } else {
    score += 20;
    if (password.length >= 16) score += 10;
    if (password.length >= 20) score += 10;
  }

  // Uppercase check
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter (A-Z)');
  } else {
    score += 15;
  }

  // Lowercase check
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter (a-z)');
  } else {
    score += 15;
  }

  // Number check
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number (0-9)');
  } else {
    score += 15;
  }

  // Special character check
  if (!/[!@#$%^&*(),.?":{}|<>_\-+=[\]\\/'~`]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&*...)');
  } else {
    score += 15;
  }

  // Common password check
  const commonPasswords = [
    'password', '123456', 'qwerty', 'abc123', 'password123',
    'admin', 'letmein', 'welcome', 'monkey', '1234567890',
    'iloveyou', 'princess', 'dragon', 'sunshine', 'master',
    '123456789', '12345678', '12345', '1234', 'password1'
  ];
  
  const lowerPassword = password.toLowerCase();
  if (commonPasswords.some(common => lowerPassword.includes(common))) {
    errors.push('Password contains common words or patterns. Please choose a more unique password');
    score -= 20;
  }

  // Sequential characters check (e.g., "aaa", "111", "abc")
  if (/(.)\1{2,}/.test(password)) {
    errors.push('Password should not contain repeated characters (e.g., "aaa")');
    score -= 10;
  }

  // Sequential patterns check (e.g., "123", "abc")
  const hasSequentialChars = /(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|012|123|234|345|456|567|678|789)/i.test(password);
  if (hasSequentialChars) {
    errors.push('Password should not contain sequential characters (e.g., "abc" or "123")');
    score -= 10;
  }

  // Bonus points for additional special characters
  const specialCharCount = (password.match(/[!@#$%^&*(),.?":{}|<>_\-+=[\]\\/'~`]/g) || []).length;
  if (specialCharCount >= 2) score += 5;
  if (specialCharCount >= 3) score += 5;

  // Bonus points for mix of character types
  const hasUpperAndLower = /[A-Z]/.test(password) && /[a-z]/.test(password);
  const hasLettersAndNumbers = /[A-Za-z]/.test(password) && /[0-9]/.test(password);
  if (hasUpperAndLower && hasLettersAndNumbers) score += 10;

  // Calculate strength
  let strength: 'weak' | 'medium' | 'strong' | 'very-strong';
  const finalScore = Math.max(0, Math.min(100, score));
  
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
 * Validates password with context-specific requirements
 * @param password - The password to validate
 * @param context - Additional validation context
 */
export function validatePasswordWithContext(
  password: string,
  context?: {
    email?: string;
    username?: string;
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

  if (context.username && context.username.length > 3) {
    if (lowerPassword.includes(context.username.toLowerCase())) {
      errors.push('Password should not contain your username');
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


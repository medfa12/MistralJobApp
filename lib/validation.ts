export function validateApiKey(apiKey: string | undefined): { valid: boolean; error?: string } {
  if (!apiKey) {
    return { valid: false, error: 'API key is required' };
  }

  if (typeof apiKey !== 'string') {
    return { valid: false, error: 'API key must be a string' };
  }

  const trimmed = apiKey.trim();
  
  if (trimmed.length === 0) {
    return { valid: false, error: 'API key cannot be empty' };
  }

  if (trimmed.length < 10) {
    return { valid: false, error: 'API key appears to be invalid' };
  }

  return { valid: true };
}

export function validateProjectName(name: string | undefined): { valid: boolean; error?: string } {
  if (!name) {
    return { valid: false, error: 'Project name is required' };
  }

  const trimmed = name.trim();
  
  if (trimmed.length === 0) {
    return { valid: false, error: 'Project name cannot be empty' };
  }

  if (trimmed.length > 200) {
    return { valid: false, error: 'Project name is too long (max 200 characters)' };
  }

  return { valid: true };
}

export function validateFileSize(size: number, maxSize: number): { valid: boolean; error?: string } {
  if (size <= 0) {
    return { valid: false, error: 'File size must be positive' };
  }

  if (size > maxSize) {
    const maxMB = Math.round(maxSize / (1024 * 1024));
    return { valid: false, error: `File size exceeds ${maxMB}MB limit` };
  }

  return { valid: true };
}

export function sanitizeInput(input: string, maxLength = 10000): string {
  return input.trim().slice(0, maxLength);
}


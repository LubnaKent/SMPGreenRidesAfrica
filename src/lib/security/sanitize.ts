/**
 * Input Sanitization Utilities
 * Prevents SQL injection and XSS attacks
 */

/**
 * Sanitize search input for Supabase queries
 * Removes potentially dangerous characters while preserving normal search functionality
 */
export function sanitizeSearchInput(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Trim whitespace
  let sanitized = input.trim();

  // Limit length to prevent DoS
  const MAX_SEARCH_LENGTH = 100;
  if (sanitized.length > MAX_SEARCH_LENGTH) {
    sanitized = sanitized.substring(0, MAX_SEARCH_LENGTH);
  }

  // Remove or escape dangerous characters for SQL LIKE queries
  // These characters have special meaning in PostgreSQL LIKE patterns
  sanitized = sanitized
    .replace(/[%_]/g, '') // Remove LIKE wildcards that could cause issues
    .replace(/['"\\;]/g, '') // Remove quotes, backslash, semicolons
    .replace(/--/g, '') // Remove SQL comment syntax
    .replace(/\/\*/g, '') // Remove block comment start
    .replace(/\*\//g, ''); // Remove block comment end

  return sanitized;
}

/**
 * Sanitize ID input (UUID format)
 * Only allows valid UUID characters
 */
export function sanitizeUUID(input: string): string | null {
  if (!input || typeof input !== 'string') {
    return null;
  }

  // UUID v4 pattern
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  const trimmed = input.trim().toLowerCase();

  if (uuidRegex.test(trimmed)) {
    return trimmed;
  }

  return null;
}

/**
 * Sanitize array of UUIDs
 */
export function sanitizeUUIDArray(inputs: string[]): string[] {
  if (!Array.isArray(inputs)) {
    return [];
  }

  return inputs
    .map(id => sanitizeUUID(id))
    .filter((id): id is string => id !== null);
}

/**
 * Sanitize email input
 */
export function sanitizeEmail(input: string): string | null {
  if (!input || typeof input !== 'string') {
    return null;
  }

  const trimmed = input.trim().toLowerCase();

  // Basic email validation
  const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;

  if (emailRegex.test(trimmed) && trimmed.length <= 254) {
    return trimmed;
  }

  return null;
}

/**
 * Sanitize phone number input
 */
export function sanitizePhone(input: string): string | null {
  if (!input || typeof input !== 'string') {
    return null;
  }

  // Remove all non-digit characters except + at the beginning
  const sanitized = input.replace(/(?!^\+)[^\d]/g, '');

  // Validate length (international numbers can be up to 15 digits)
  if (sanitized.length >= 7 && sanitized.length <= 16) {
    return sanitized;
  }

  return null;
}

/**
 * Sanitize general text input (for names, notes, etc.)
 */
export function sanitizeText(input: string, maxLength: number = 500): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  let sanitized = input.trim();

  // Limit length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  // Remove null bytes and control characters (except newlines and tabs)
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  return sanitized;
}

/**
 * Sanitize enum value - ensures value is in allowed list
 */
export function sanitizeEnum<T extends string>(
  input: string,
  allowedValues: readonly T[]
): T | null {
  if (!input || typeof input !== 'string') {
    return null;
  }

  const trimmed = input.trim() as T;

  if (allowedValues.includes(trimmed)) {
    return trimmed;
  }

  return null;
}

/**
 * Sanitize numeric input
 */
export function sanitizeNumber(
  input: string | number,
  options: { min?: number; max?: number; allowFloat?: boolean } = {}
): number | null {
  const { min, max, allowFloat = false } = options;

  let num: number;

  if (typeof input === 'number') {
    num = input;
  } else if (typeof input === 'string') {
    num = allowFloat ? parseFloat(input) : parseInt(input, 10);
  } else {
    return null;
  }

  if (isNaN(num) || !isFinite(num)) {
    return null;
  }

  if (min !== undefined && num < min) {
    return null;
  }

  if (max !== undefined && num > max) {
    return null;
  }

  return num;
}

/**
 * Escape HTML to prevent XSS
 */
export function escapeHtml(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };

  return input.replace(/[&<>"'/]/g, (char) => htmlEscapes[char] || char);
}

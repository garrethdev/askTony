/**
 * Normalize an email for comparisons.
 * @param email - Raw email string.
 */
export const normalizeEmail = (email: string): string =>
  email.trim().toLowerCase();

/**
 * Conditionally join strings with a space.
 * @param parts - List of string parts.
 */
export const joinWords = (...parts: Array<string | undefined>): string =>
  parts.filter(Boolean).join(' ');


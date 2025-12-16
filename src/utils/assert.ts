import { AppError, internalError } from '../domain/errors';

/**
 * Assert a condition and throw an AppError when it fails.
 * @param condition - Boolean expression to validate.
 * @param error - AppError to throw if the assertion fails.
 */
export const assertOrThrow = (condition: unknown, error: AppError): void => {
  if (!condition) {
    throw error;
  }
};

/**
 * Ensure a value is present, otherwise throw an internal error.
 * @param value - Value to check.
 */
export const requireValue = <T>(value: T | null | undefined): T => {
  if (value === null || value === undefined) {
    throw internalError('Unexpected empty value');
  }
  return value;
};


/**
 * Time abstraction for deterministic testing.
 */
export interface Clock {
  now(): Date;
}

/**
 * Default clock using the system time.
 */
export const systemClock: Clock = {
  now: () => new Date()
};


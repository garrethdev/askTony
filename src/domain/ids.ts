import { randomUUID } from 'crypto';

/**
 * ID generator abstraction.
 */
export interface IdGenerator {
  newId(): string;
}

/**
 * Default ID generator using randomUUID.
 */
export const uuidGenerator: IdGenerator = {
  newId: () => randomUUID()
};


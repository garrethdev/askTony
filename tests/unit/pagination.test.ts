import { describe, expect, it } from 'vitest';
import { decodeCursor, encodeCursor } from '../../src/utils/pagination';

describe('cursor pagination', () => {
  it('round-trips encode and decode', () => {
    const cursor = encodeCursor({ createdAt: '2023-01-01T00:00:00.000Z', id: 'abc' });
    const decoded = decodeCursor(cursor);
    expect(decoded).toEqual({ createdAt: '2023-01-01T00:00:00.000Z', id: 'abc' });
  });
});


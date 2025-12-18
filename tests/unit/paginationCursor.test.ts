import { describe, expect, it } from 'vitest';
import { encodeCursor, decodeCursor } from '../../src/utils/pagination';

describe('cursor encoding', () => {
  it('encodes/decodes created_at|id', () => {
    const payload = { createdAt: '2024-01-01T00:00:00.000Z', id: 'abc' };
    const encoded = encodeCursor(payload);
    const decoded = decodeCursor(encoded);
    expect(decoded).toEqual(payload);
  });
});


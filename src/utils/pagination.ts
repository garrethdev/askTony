export interface CursorPayload {
  createdAt: string;
  id: string;
}

/**
 * Encode a cursor payload to a URL-safe string.
 * @param payload - Created-at ISO string and id.
 */
export const encodeCursor = (payload: CursorPayload): string =>
  Buffer.from(JSON.stringify(payload)).toString('base64url');

/**
 * Decode a cursor string back to its payload.
 * @param cursor - Encoded cursor string.
 */
export const decodeCursor = (cursor: string): CursorPayload => {
  const raw = Buffer.from(cursor, 'base64url').toString('utf8');
  const parsed = JSON.parse(raw) as CursorPayload;
  return parsed;
};


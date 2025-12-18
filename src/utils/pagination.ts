export interface CursorPayload {
  createdAt: string;
  id: string;
}

// Contract: cursor = base64("created_at|id")
export const encodeCursor = (payload: CursorPayload): string =>
  Buffer.from(`${payload.createdAt}|${payload.id}`).toString('base64url');

export const decodeCursor = (cursor: string): CursorPayload => {
  const raw = Buffer.from(cursor, 'base64url').toString('utf8');
  const [createdAt, id] = raw.split('|');
  return { createdAt, id };
};


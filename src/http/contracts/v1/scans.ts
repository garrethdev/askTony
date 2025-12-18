import { z } from 'zod';
import { cursorSchema } from './shared';

export const createScanResponse = z.object({
  scan_id: z.string().uuid(),
  cohort_id: z.string().uuid()
});

export const uploadUrlRequest = z.object({
  mime_type: z.string()
});

export const uploadUrlResponse = z.object({
  upload_url: z.string(),
  storage_key: z.string()
});

export const scanAnalyzeResponse = z.object({
  scan_id: z.string().uuid(),
  status: z.literal('analyzing')
});

export const scanGetResponse = z.object({
  scan_id: z.string().uuid(),
  status: z.string(),
  metabolic_score: z.number().optional(),
  tag_keys: z.array(z.string()).optional(),
  explanation_short: z.string().optional()
});

export const scanListQuery = z.object({
  cursor: cursorSchema.optional(),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? Number(val) : 20))
    .pipe(z.number().int().positive().max(100))
});

export const scanListItem = z.object({
  scan_id: z.string().uuid(),
  status: z.string(),
  created_at: z.string(),
  metabolic_score: z.number().optional(),
  tag_keys: z.array(z.string()).optional()
});

export const scanListResponse = z.object({
  scans: z.array(scanListItem),
  next_cursor: z.string().nullable()
});

export const scanDeleteResponse = z.object({
  ok: z.literal(true)
});


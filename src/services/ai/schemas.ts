import { z } from 'zod';

export const buildAnalysisSchema = (allowedTags: string[]) =>
  z.object({
    headline: z.string(),
    metabolic_score: z
      .number()
      .min(0)
      .max(10)
      .refine((v) => Number.isFinite(v) && Math.round(v * 2) === v * 2, {
        message: 'metabolic_score must be in 0.5 increments'
      }),
    tag_keys: z.array(z.string()).refine((arr) => arr.every((t) => allowedTags.includes(t)), {
      message: 'tag_keys must be subset of allowed'
    }),
    gets_right: z.array(z.string()).min(1).max(3),
    things_to_watch: z.array(z.string()).min(1).max(2),
    explanation_short: z.string().max(240),
    confidence: z.number().min(0).max(1),
    model_version: z.string()
  });

export type AnalysisSchema = ReturnType<typeof buildAnalysisSchema>;


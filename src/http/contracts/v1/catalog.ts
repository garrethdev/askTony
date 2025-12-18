import { z } from 'zod';
import { tagDefinitionSchema } from './shared';

export const catalogTagsResponse = z.object({
  tags: z.array(tagDefinitionSchema)
});

export const catalogOnboardingResponse = z.object({
  main_reasons: z.array(z.string()),
  challenges: z.array(z.string()),
  eating_patterns: z.array(z.string())
});


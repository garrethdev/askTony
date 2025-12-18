import { z } from 'zod';

export const onboardingResponse = z.object({
  main_reason_key: z.string().nullable(),
  main_challenges_keys: z.array(z.string()),
  eating_pattern_key: z.string().nullable(),
  completed_at: z.string().nullable()
});

export const onboardingReasonRequest = z.object({
  main_reason_key: z.string()
});
export const onboardingReasonResponse = z.object({
  main_reason_key: z.string()
});

export const onboardingChallengesRequest = z.object({
  main_challenges_keys: z.array(z.string())
});
export const onboardingChallengesResponse = z.object({
  main_challenges_keys: z.array(z.string())
});

export const onboardingEatingPatternRequest = z.object({
  eating_pattern_key: z.string()
});
export const onboardingEatingPatternResponse = z.object({
  eating_pattern_key: z.string()
});

export const onboardingCompleteResponse = z.object({
  completed_at: z.string(),
  cohort_id: z.string().uuid(),
  week_start: z.string()
});


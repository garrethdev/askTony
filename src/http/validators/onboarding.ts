import { z } from 'zod';

export const onboardingReasonSchema = z.object({
  mainReason: z.string().min(1)
});

export const onboardingChallengesSchema = z.object({
  challenges: z.array(z.string()).max(10)
});

export const onboardingEatingPatternSchema = z.object({
  eatingPattern: z.string().min(1)
});


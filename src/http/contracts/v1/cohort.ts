import { z } from 'zod';

export const cohortCurrentResponse = z.object({
  cohort_id: z.string().uuid(),
  week_start: z.string(),
  cohort_key: z.string()
});

export const cohortMembersQuery = z.object({
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? Number(val) : 20))
    .pipe(z.number().int().positive().max(100))
});

export const cohortMembersResponse = z.object({
  members: z.array(
    z.object({
      nickname: z.string(),
      username: z.string(),
      avatar_id: z.string()
    })
  )
});


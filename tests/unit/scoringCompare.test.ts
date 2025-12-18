import { describe, expect, it, vi } from 'vitest';
import { compareScoreToBaseline } from '../../src/services/scoring';

const mockQuery = (responses: any[]) => {
  let idx = 0;
  return () => ({
    rows: responses[idx++] || []
  });
};

describe('compareScoreToBaseline labels', () => {
  it('labels relative to user and cohort baselines', async () => {
    const db: any = { query: vi.fn() };
    // current meal
    db.query
      // current entity
      .mockReturnValueOnce({ rows: [{ metabolic_score: 7, tag_keys: ['balance_green'] }] })
      // user baseline
      .mockReturnValueOnce({
        rows: [
          { metabolic_score: 6, tag_keys: ['balance_green'] },
          { metabolic_score: 5, tag_keys: [] }
        ]
      })
      // cohort baseline
      .mockReturnValueOnce({
        rows: [
          { metabolic_score: 5, tag_keys: [] },
          { metabolic_score: 4, tag_keys: [] }
        ]
      });

    const result = await compareScoreToBaseline(
      db,
      { entityType: 'meal', entityId: 'm1', baselineDays: 30, userId: 'u1', cohortId: 'c1' },
      { balance_green: 'balance' } as any
    );
    expect(result.vs_user.balance).toBeTypeOf('string');
    expect(result.vs_cohort.balance).toBeTypeOf('string');
  });
});


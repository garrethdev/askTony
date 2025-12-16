import { describe, expect, it } from 'vitest';
import { scoreManualMeal } from '../../src/services/scoring';

describe('scoreManualMeal', () => {
  it('rewards veggies and penalizes processed items', () => {
    const healthy = scoreManualMeal({ description: 'Grilled chicken with salad' });
    const fried = scoreManualMeal({ description: 'Fried wings with soda' });

    expect(healthy.score).toBeGreaterThan(fried.score);
    expect(healthy.tags).toContain('veggies');
    expect(fried.tags).toContain('processed');
  });
});


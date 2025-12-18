import { describe, expect, it } from 'vitest';
import { scoreManualMeal } from '../../src/services/scoring';

describe('scoreManualMeal', () => {
  it('rewards veggies and penalizes processed items', () => {
    const healthy = scoreManualMeal({ meal_name: 'Grilled chicken with salad' });
    const fried = scoreManualMeal({ meal_name: 'Fried wings with soda', energy_level: 'low' });

    expect(healthy.metabolic_score).toBeGreaterThan(fried.metabolic_score);
    expect(healthy.tag_keys.length).toBeGreaterThanOrEqual(0);
  });
});


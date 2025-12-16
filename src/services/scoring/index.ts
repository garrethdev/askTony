import { DbClient, query } from '../../db/pool';
import { MealId, ScanId } from '../../domain/types';
import { unique } from '../../utils/arrays';

export interface ManualMealInput {
  description: string;
  tags?: string[];
}

export interface ManualMealScore {
  score: number;
  tags: string[];
  explanation: string;
}

export interface CompareInput {
  entityType: 'meal' | 'scan';
  entityId: MealId | ScanId;
  baselineDays: number;
  userId: string;
}

/**
 * Pure scoring function for manual meals.
 * @param input - Meal description and optional tags.
 */
export const scoreManualMeal = (input: ManualMealInput): ManualMealScore => {
  const lower = input.description.toLowerCase();
  let score = 50;
  const derivedTags: string[] = [];

  if (lower.includes('salad') || lower.includes('vegetable')) {
    score += 15;
    derivedTags.push('veggies');
  }
  if (lower.includes('fried') || lower.includes('sugar')) {
    score -= 10;
    derivedTags.push('processed');
  }
  if (lower.includes('grilled') || lower.includes('baked')) {
    score += 5;
  }
  if (lower.includes('soda')) {
    score -= 8;
  }

  const tags = unique([...(input.tags ?? []), ...derivedTags]);
  const explanation =
    score >= 60
      ? 'Good balance with nutrient-dense items.'
      : 'Consider adding vegetables and reducing processed items.';

  return { score: Math.max(0, Math.min(100, score)), tags, explanation };
};

/**
 * Compare an entity score to baseline averages.
 * @param db - Database client.
 * @param input - Comparison parameters.
 */
export const compareScoreToBaseline = async (
  db: DbClient,
  input: CompareInput
): Promise<{ baseline: number; current?: number }> => {
  const baseline = await query<{ avg: number | null }>(
    db,
    `SELECT AVG(score) as avg FROM meals
     WHERE user_id = $1
       AND consumed_at >= (now() - ($2 || ' days')::interval)`,
    [input.userId, input.baselineDays]
  );

  const current =
    input.entityType === 'meal'
      ? await query<{ score: number | null }>(
          db,
          `SELECT score FROM meals WHERE id = $1 LIMIT 1`,
          [input.entityId]
        )
      : await query<{ score: number | null }>(
          db,
          `SELECT score FROM meals WHERE scan_id = $1 LIMIT 1`,
          [input.entityId]
        );

  return {
    baseline: baseline.rows[0]?.avg ?? 0,
    current: current.rows[0]?.score ?? undefined
  };
};


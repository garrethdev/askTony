import { DbClient, query } from '../../db/pool';
import { MealId, ScanId } from '../../domain/types';
import { unique } from '../../utils/arrays';

export interface ManualMealInput {
  meal_name: string;
  meal_description?: string;
  meal_type?: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'other';
  energy_level?: 'low' | 'ok' | 'high';
  eaten_at?: string;
}

export interface ManualMealScore {
  metabolic_score: number;
  tag_keys: string[];
  explanation_short: string;
}

export interface CompareInput {
  entityType: 'meal' | 'scan';
  entityId: MealId | ScanId;
  baselineDays: number;
  userId: string;
  cohortId: string;
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

export const scoreManualMeal = (input: ManualMealInput): ManualMealScore => {
  const text = `${input.meal_name} ${input.meal_description ?? ''}`.toLowerCase();
  let score = 5;
  const tags: string[] = [];
  if (text.includes('salad') || text.includes('vegetable')) {
    score += 2;
    tags.push('balance_green');
  }
  if (text.includes('fried') || text.includes('sugar') || text.includes('soda')) {
    score -= 2;
    tags.push('energy_fast');
  }
  if (input.energy_level === 'high') score += 0.5;
  if (input.energy_level === 'low') score -= 0.5;
  const metabolic_score = clamp(score, 0, 10);
  const explanation_short =
    metabolic_score >= 6
      ? 'Good balance with some nutrient-dense items.'
      : 'Consider adding veggies and reducing processed items.';
  return { metabolic_score, tag_keys: unique(tags), explanation_short };
};

type Dim = 'balance' | 'energy' | 'digestion';

const labelVsMean = (value: number, mean: number, std: number): string => {
  if (value >= mean + 0.5 * std) return 'Higher than usual';
  if (value <= mean - 0.5 * std) return 'Lower than usual';
  return 'About your usual';
};

const labelVsCohort = (value: number, mean: number, std: number): string => {
  if (value >= mean + 0.5 * std) return 'Above most';
  if (value <= mean - 0.5 * std) return 'Below most';
  return 'About average';
};

const meanStd = (nums: number[]): { mean: number; std: number } => {
  if (!nums.length) return { mean: 0, std: 1 };
  const mean = nums.reduce((a, b) => a + b, 0) / nums.length;
  const variance =
    nums.reduce((a, b) => a + (b - mean) * (b - mean), 0) / (nums.length || 1);
  return { mean, std: Math.sqrt(variance) || 1 };
};

const dimScore = (metabolic: number, tagCount: number): number =>
  clamp(metabolic * 10 + tagCount * 5, 0, 100);

export const compareScoreToBaseline = async (
  db: DbClient,
  input: CompareInput,
  tagCategories: Record<string, Dim>
): Promise<{
  vs_user: Record<Dim, string>;
  vs_cohort: Record<Dim, string>;
}> => {
  const currentRes =
    input.entityType === 'meal'
      ? await query<{ metabolic_score: number; tag_keys: string[] }>(
          db,
          `SELECT metabolic_score, tag_keys FROM meals WHERE id = $1 LIMIT 1`,
          [input.entityId]
        )
      : await query<{ metabolic_score: number; tag_keys: string[] }>(
          db,
          `SELECT metabolic_score, tag_keys FROM meal_scans WHERE id = $1 LIMIT 1`,
          [input.entityId]
        );
  const current = currentRes.rows[0];
  const fetchScores = async (scopeSql: string, params: unknown[]) => {
    const res = await query<{ metabolic_score: number; tag_keys: string[] | null }>(
      db,
      scopeSql,
      params
    );
    return res.rows.map((r) => ({
      metabolic: Number(r.metabolic_score ?? 0),
      tag_keys: r.tag_keys ?? []
    }));
  };
  const sinceSql = `created_at >= (now() - ($2 || ' days')::interval)`;
  const userMeals = await fetchScores(
    `SELECT metabolic_score, tag_keys FROM meals WHERE user_id = $1 AND ${sinceSql}`,
    [input.userId, input.baselineDays]
  );
  const cohortMeals = await fetchScores(
    `SELECT metabolic_score, tag_keys FROM meals WHERE cohort_id = $1 AND ${sinceSql}`,
    [input.cohortId, input.baselineDays]
  );

  const scoreDim = (samples: typeof userMeals) => {
    const dims: Record<Dim, number[]> = { balance: [], energy: [], digestion: [] };
    samples.forEach((m) => {
      const counts: Record<Dim, number> = { balance: 0, energy: 0, digestion: 0 };
      m.tag_keys.forEach((t) => {
        const dim = tagCategories[t];
        if (dim) counts[dim] += 1;
      });
      (Object.keys(dims) as Dim[]).forEach((d) => {
        dims[d].push(dimScore(m.metabolic, counts[d]));
      });
    });
    const stats = {} as Record<Dim, { mean: number; std: number }>;
    (Object.keys(dims) as Dim[]).forEach((d) => {
      stats[d] = meanStd(dims[d]);
    });
    return stats;
  };

  const userStats = scoreDim(userMeals);
  const cohortStats = scoreDim(cohortMeals);

  const currentCounts: Record<Dim, number> = { balance: 0, energy: 0, digestion: 0 };
  (current?.tag_keys ?? []).forEach((t) => {
    const dim = tagCategories[t];
    if (dim) currentCounts[dim] += 1;
  });
  const currentDimScore = (dim: Dim) =>
    dimScore(Number(current?.metabolic_score ?? 0), currentCounts[dim]);

  const vs_user = {} as Record<Dim, string>;
  const vs_cohort = {} as Record<Dim, string>;
  (['balance', 'energy', 'digestion'] as Dim[]).forEach((dim) => {
    const cur = currentDimScore(dim);
    vs_user[dim] = labelVsMean(cur, userStats[dim].mean, userStats[dim].std);
    vs_cohort[dim] = labelVsCohort(cur, cohortStats[dim].mean, cohortStats[dim].std);
  });

  return { vs_user, vs_cohort };
};


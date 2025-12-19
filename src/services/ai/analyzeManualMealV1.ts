import { buildAnalysisSchema } from './schemas';
import { callWithRepair } from './callWithRepair';
import { manualSystemPrompt } from './prompts';
import { LlmClient, AnalysisResult } from './types';
import { AppError } from '../../domain/errors';

const clampScore = (score: number): number => {
  const clamped = Math.min(10, Math.max(0, score));
  return Math.round(clamped * 2) / 2;
};

export interface ManualMealInput {
  allowedTags: string[];
  mealName: string;
  mealDescription?: string;
  mealType?: string | null;
  energyLevel?: string | null;
  locale?: string;
}

export const analyzeManualMealV1 = async (
  llm: LlmClient,
  input: ManualMealInput
): Promise<AnalysisResult> => {
  const schema = buildAnalysisSchema(input.allowedTags);
  const userPrompt = `Allowed tags (use only tag_key values):
${JSON.stringify(input.allowedTags)}

Meal input:
- meal_name: ${input.mealName}
- meal_description: ${input.mealDescription ?? ''}
- meal_type: ${input.mealType ?? 'null'}
- energy_level: ${input.energyLevel ?? 'null'}
- locale: ${input.locale ?? 'en-US'}

Task:
Produce the JSON response.`;

  const run = async () =>
    llm.chatJson({
      system: manualSystemPrompt,
      user: userPrompt
    });

  const result = await callWithRepair({ llm, run, schema });
  return {
    ...result,
    metabolic_score: clampScore(result.metabolic_score),
    model_version: result.model_version
  };
};


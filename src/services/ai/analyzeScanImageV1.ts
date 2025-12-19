import { buildAnalysisSchema } from './schemas';
import { callWithRepair } from './callWithRepair';
import { scanSystemPrompt } from './prompts';
import { LlmClient, AnalysisResult } from './types';

export interface ScanInput {
  allowedTags: string[];
  imageUrl: string;
  mealType?: string | null;
  energyLevel?: string | null;
  eatenAtLocal?: string | null;
  locale?: string;
}

export const analyzeScanImageV1 = async (
  llm: LlmClient,
  input: ScanInput
): Promise<AnalysisResult> => {
  const schema = buildAnalysisSchema(input.allowedTags);
  const userPrompt = `Allowed tags (use only tag_key values):
${JSON.stringify(input.allowedTags)}

Context:
- meal_type: ${input.mealType ?? 'null'}
- energy_level: ${input.energyLevel ?? 'null'}
- locale: ${input.locale ?? 'en-US'}
- eaten_at_local: ${input.eatenAtLocal ?? 'null'}

Task:
Analyze the attached meal photo and produce the JSON response.`;

  const run = async () =>
    llm.chatJson({
      system: scanSystemPrompt,
      user: userPrompt,
      images: [{ url: input.imageUrl }]
    });

  const result = await callWithRepair({ llm, run, schema });
  return result;
};


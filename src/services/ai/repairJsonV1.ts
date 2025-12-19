import { LlmClient } from './types';

export const buildRepairPrompt = (schemaJson: string, badOutput: string): string =>
  `Schema (JSON):
${schemaJson}

Bad output:
${badOutput}

Fix it to match the schema exactly. Output JSON only.`;

export const repairJsonV1 = async (
  llm: LlmClient,
  schemaJson: string,
  badOutput: string
): Promise<string> =>
  llm.chatJson({
    system:
      'You are a JSON repair tool. Output valid JSON only matching the provided schema. Do not add keys. Do not add commentary.',
    user: buildRepairPrompt(schemaJson, badOutput)
  });


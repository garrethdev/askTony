import { describe, expect, it } from 'vitest';
import { analyzeManualMealV1 } from '../../src/services/ai/analyzeManualMealV1';
import { FakeLlmClient } from '../../src/services/ai/FakeLlmClient';
import { callWithRepair } from '../../src/services/ai/callWithRepair';
import { buildAnalysisSchema } from '../../src/services/ai/schemas';
import { repairJsonV1 } from '../../src/services/ai/repairJsonV1';
import { AppError } from '../../src/domain/errors';

describe('AI analysis validation', () => {
  it('clamps score to 0.5 increments', async () => {
    const llm = new FakeLlmClient();
    const res = await analyzeManualMealV1(llm, {
      allowedTags: ['balance_green'],
      mealName: 'Test'
    });
    expect(res.metabolic_score % 0.5).toBe(0);
  });

  it('fails if tag not allowed after repair', async () => {
    const schema = buildAnalysisSchema(['allowed']);
    const llm = {
      chatJson: async () => JSON.stringify({ headline: 'x', metabolic_score: 5, tag_keys: ['bad'], gets_right: ['a'], things_to_watch: ['b'], explanation_short: 'ok', confidence: 0.5, model_version: 'm1' })
    };
    await expect(
      callWithRepair({ llm: llm as any, run: llm.chatJson, schema })
    ).rejects.toBeInstanceOf(Error);
  });
});


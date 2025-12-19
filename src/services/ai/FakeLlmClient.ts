import { LlmClient } from './types';

export class FakeLlmClient implements LlmClient {
  async chatJson(): Promise<string> {
    return JSON.stringify({
      headline: 'Balanced meal',
      metabolic_score: 7.5,
      tag_keys: ['balance_green'],
      gets_right: ['Includes veggies'],
      things_to_watch: ['Portion size'],
      explanation_short: 'Seems balanced with some greens.',
      confidence: 0.8,
      model_version: 'fake-1'
    });
  }
}


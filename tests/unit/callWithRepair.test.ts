import { describe, expect, it } from 'vitest';
import { callWithRepair } from '../../src/services/ai/callWithRepair';
import { z } from 'zod';

const schema = z.object({
  ok: z.literal(true)
});

class StubLlm {
  attempts = 0;
  async chatJson(): Promise<string> {
    this.attempts += 1;
    return JSON.stringify({ ok: true });
  }
}

describe('callWithRepair', () => {
  it('retries once and succeeds', async () => {
    const llm = new StubLlm();
    const out = await callWithRepair({
      llm: llm as any,
      run: async () => {
        if (llm.attempts === 0) {
          llm.attempts += 1;
          throw new Error('bad');
        }
        return JSON.stringify({ ok: true });
      },
      schema
    });
    expect(out).toEqual({ ok: true });
  });
});


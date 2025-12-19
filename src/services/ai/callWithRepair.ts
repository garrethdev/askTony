import { ZodSchema } from 'zod';
import { LlmClient } from './types';
import { repairJsonV1 } from './repairJsonV1';
import { AppError } from '../../domain/errors';

interface CallWithRepairParams<T> {
  llm: LlmClient;
  run: () => Promise<string>;
  schema: ZodSchema<T>;
}

export const callWithRepair = async <T>({
  llm,
  run,
  schema
}: CallWithRepairParams<T>): Promise<T> => {
  const attempt = async (raw: string): Promise<T> => {
    const parsed = JSON.parse(raw);
    return schema.parse(parsed);
  };

  let first: string;
  try {
    first = await run();
    return await attempt(first);
  } catch (err) {
    // fallthrough to repair
  }

  try {
    const repair = await repairJsonV1(llm, JSON.stringify(schema), first!);
    return await attempt(repair);
  } catch (err) {
    throw new AppError('AI_INVALID_OUTPUT', 'AI output invalid', 502);
  }
};


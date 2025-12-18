import { z } from 'zod';

export const energyLevelSchema = z.enum(['low', 'ok', 'high']);
export const mealTypeSchema = z.enum(['breakfast', 'lunch', 'dinner', 'snack', 'other']);
export const targetTypeSchema = z.enum(['meal', 'reflection']);

export const cursorSchema = z.string().min(1);
export const uuidSchema = z.string().uuid();

export const tagCategorySchema = z.enum(['balance', 'energy', 'digestion', 'general']);

export const tagDefinitionSchema = z.object({
  tag_key: z.string(),
  display_name: z.string(),
  category: tagCategorySchema,
  sort_order: z.number()
});


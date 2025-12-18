import { DbClient } from '../../db/pool';
import { listTags } from '../../db/queries/catalog';

export const buildTagCategoryMap = async (
  db: DbClient
): Promise<Record<string, 'balance' | 'energy' | 'digestion' | 'general'>> => {
  const tags = await listTags(db);
  return tags.reduce<Record<string, 'balance' | 'energy' | 'digestion' | 'general'>>(
    (acc, t) => {
      acc[t.tag_key] = t.category as any;
      return acc;
    },
    {}
  );
};


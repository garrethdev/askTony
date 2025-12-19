import { DbClient, query } from '../../db/pool';

const FALLBACK_TAGS = [
  { tag_key: 'balance_green', category: 'balance' },
  { tag_key: 'energy_fast', category: 'energy' },
  { tag_key: 'digestion_light', category: 'digestion' }
];

export const getAllowedTags = async (db: DbClient): Promise<string[]> => {
  const res = await query<{ tag_key: string }>(
    db,
    `SELECT tag_key FROM tag_definitions WHERE is_active = true`
  );
  const tags = res.rows.map((r) => r.tag_key);
  return tags.length ? tags : FALLBACK_TAGS.map((t) => t.tag_key);
};


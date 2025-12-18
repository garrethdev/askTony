import { DbClient, query } from '../pool';

export interface TagDefinitionRow {
  tag_key: string;
  display_name: string;
  category: string;
  sort_order: number;
}

export const listTags = async (db: DbClient): Promise<TagDefinitionRow[]> => {
  const result = await query<TagDefinitionRow>(
    db,
    `SELECT tag_key, display_name, category, sort_order
     FROM tag_definitions
     WHERE is_active = true
     ORDER BY sort_order ASC, tag_key ASC`,
    []
  );
  return result.rows;
};


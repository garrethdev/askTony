import { catalogTagsResponse } from '../../contracts/v1/catalog';

export const mapTagsResponse = (rows: Array<{
  tag_key: string;
  display_name: string;
  category: string;
  sort_order: number;
}>) => catalogTagsResponse.parse({ tags: rows });


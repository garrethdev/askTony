import { describe, expect, it } from 'vitest';
import { mapTagsResponse } from '../../src/http/mappers/v1/catalog';

describe('catalog mapper', () => {
  it('maps rows into contract response', () => {
    const out = mapTagsResponse([
      { tag_key: 'balance_green', display_name: 'Greens', category: 'balance', sort_order: 1 }
    ]);
    expect(out).toEqual({
      tags: [
        {
          tag_key: 'balance_green',
          display_name: 'Greens',
          category: 'balance',
          sort_order: 1
        }
      ]
    });
  });
});


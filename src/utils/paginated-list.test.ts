import { getPaginatedList } from './paginated-list';

describe('getPaginatedList', () => {
  const items = Array.from({ length: 10 }, (_, index) => `post-${index + 1}`);

  it('uses the server pagination response without changing it', () => {
    const response = {
      data: items.slice(0, 8),
      meta: { total: 10, perPage: 8, currentPage: 1, lastPage: 2 },
    };

    expect(getPaginatedList(response, 1, 8)).toEqual(response);
  });

  it('creates local pages when the server returns a plain list', () => {
    expect(getPaginatedList(items, 2, 8)).toEqual({
      data: ['post-9', 'post-10'],
      meta: { total: 10, perPage: 8, currentPage: 2, lastPage: 2 },
    });
  });

  it('clamps a requested page to the valid range', () => {
    const result = getPaginatedList(items, 20, 8);

    expect(result.data).toEqual(['post-9', 'post-10']);
    expect(result.meta.currentPage).toBe(2);
  });

  it('returns an empty first page for an empty list', () => {
    expect(getPaginatedList<string>([], 1, 8)).toEqual({
      data: [],
      meta: { total: 0, perPage: 8, currentPage: 1, lastPage: 1 },
    });
  });
});

/**
 * Return unique values while preserving order.
 * @param items - Input array.
 */
export const unique = <T>(items: T[]): T[] => {
  const seen = new Set<T>();
  const out: T[] = [];
  items.forEach((item) => {
    if (!seen.has(item)) {
      seen.add(item);
      out.push(item);
    }
  });
  return out;
};


export const LRUCache = <K extends PropertyKey, V>(
  fetch: (key: K) => V,
  maxItems: number,
) => {
  const keys: K[] = [];
  const cache: Map<K, V> = new Map();

  return (key: K) => {
    const cached = cache[key];
    if (cached !== undefined) {
      keys.splice(keys.indexOf(key, 1));
      keys.push(key);
      return cached;
    }

    while (keys.length > maxItems) {
      cache.delete(keys.shift());
    }

    keys.push(key);
    return (cache[key] = fetch(key));
  };
};

export const getGroupedByTimeMemo = (fn) => {
  const cache = {};
  return async (date, interval, limit) => {
    if (`${date}.${interval}.${limit}` in cache && date !== 0) {
      return cache[`${date}.${interval}.${limit}`];
    }
    const result = await fn(date, interval, limit);
    cache[`${date}.${interval}.${limit}`] = result;
    return result;
  };
};

export const getGroupedByTimeMemo = (fn) => {
  const cache = {};
  setInterval(() => {
    Object.keys(cache).map((key) => {
      if (cache[key].expire > Date.now()) {
        delete cache[key];
      }
    });
  }, 120000);
  return async (date, interval, limit) => {
    if (`${date}.${interval}.${limit}` in cache && date !== 0) {
      const hit = cache[`${date}.${interval}.${limit}`];
      if (hit.expire < Date.now()) {
        return hit.payload;
      }
    }
    const payload = await fn(date, interval, limit);
    if (date !== 0) {
      cache[`${date}.${interval}.${limit}`] = {
        expire: Date.now() + 120000,
        payload,
      };
    }
    return payload;
  };
};

const CACHE_LOCATION = ".strava-cache";
export const cache = async <T>(
  key: string,
  request: () => Promise<T>,
): Promise<T> => {
  const fs = require("fs");
  const fsp = fs.promises;
  const path = require("path");
  const cachePath = path.join(CACHE_LOCATION, key + ".json");

  return fsp
    .readFile(cachePath)
    .then((data: string) => {
      return JSON.parse(data);
    })
    .catch(async () => writeCache<T>(key, request));
};

export const readCache = <T>(
  key: string,
  defaultValue: T | null = null,
): Promise<T | null> => {
  const fsp = require("fs").promises;
  const path = require("path");
  const cachePath = path.join(CACHE_LOCATION, key + ".json");
  return fsp
    .readFile(cachePath)
    .then((data: string) => JSON.parse(data))
    .catch(() => {
      return defaultValue;
    });
};

export const writeCache = async <T>(
  key: string,
  request: () => Promise<T>,
): Promise<T> => {
  const fs = require("fs");
  const path = require("path");
  const cachePath = path.join(CACHE_LOCATION, key + ".json");
  const result = await request();
  try {
    fs.writeFileSync(cachePath, JSON.stringify(result), "utf-8");
  } catch (err) {
    console.error(err);
  }
  return result;
};

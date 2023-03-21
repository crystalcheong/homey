/**
 * @title Unique Object List
 * @description Returns a unique list of objects by key
 **/

export const getUniqueObjectList = <T>(array: T[], key: keyof T): T[] =>
  Array.from(new Map(array.map((item) => [item[key], item])).values());

export const getUniqueObjectListwithKeys = <T>(
  list: T[],
  keys: (keyof T)[]
): T[] =>
  list.filter(
    (item, index, self) =>
      index === self.findIndex((t) => keys.every((key) => t[key] === item[key]))
  );

export const getUniqueSetList = <T>(array: T[]): T[] =>
  Array.from(new Set(array));

export const getPartialClonedObject = <T extends object, K extends keyof T>(
  obj: T,
  keysToInclude: K[],
  includeKeys = false
): Pick<T, K> | Omit<T, K> =>
  Object.fromEntries(
    Object.entries(obj).filter(([key]) =>
      includeKeys
        ? keysToInclude.includes(key as K)
        : !keysToInclude.includes(key as K)
    )
  ) as Pick<T, K> | Omit<T, K>;

/**
 * @title Array Limiter
 * @description Limits an array while considering if the given array is less than the specified limit
 */
export const getLimitedArray = <T>(array: T[], limit: number): T[] =>
  Array.from(array.slice(0, Math.min(array.length, limit)));

/**
 * @title Name Initials
 * @description Generate initals from name string
 */
export const getNameInitials = (name: string) => {
  const rgxInitals = new RegExp(/(\p{L}{1})\p{L}+/, "gu");

  const arrInitials = [...name.matchAll(rgxInitals)] || [];
  const strInitials = (
    (arrInitials.shift()?.[1] || "") + (arrInitials.pop()?.[1] || "")
  ).toUpperCase();

  return strInitials;
};

export const toTitleCase = (str: string) =>
  str.replace(
    /(^\w|\s\w)(\S*)/g,
    (_, m1, m2) => m1.toUpperCase() + m2.toLowerCase()
  );

export const getObjectValueCount = <T extends Record<string, unknown>>(
  obj: T
): number =>
  Object.values(obj).filter((value: unknown) =>
    Array.isArray(value)
      ? value.length > 0
      : value !== null && value !== undefined && value !== ""
  ).length;

export const getCurrentTimestamp = () => Math.floor(Date.now() / 1000);

export const getTimestampAgeInDays = (unixTimestamp: number): number => {
  const oneDayInMilliseconds = 24 * 60 * 60 * 1000; // 1 day in milliseconds
  const now = Date.now();
  const differenceInMilliseconds = now - unixTimestamp * 1000;
  const ageInDays = Math.floor(differenceInMilliseconds / oneDayInMilliseconds);
  return Math.max(ageInDays, 0);
};

export type CachedData<T> = {
  cachedAt: number;
  data: T;
};

export const createCachedObject = <T>(data: T): CachedData<T> => ({
  cachedAt: getCurrentTimestamp(),
  data,
});

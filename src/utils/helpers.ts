/**
 * @title Unique Object List
 * @description Returns a unique list of objects by key
 **/

export const getUniqueObjectList = <T>(array: T[], key: keyof T): T[] =>
  Array.from(new Map(array.map((item) => [item[key], item])).values());

export const getUniqueSetList = <T>(array: T[]): T[] =>
  Array.from(new Set(array));

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

/**
 * @title Unique Object List
 * @description Returns a unique list of objects by key
 **/

export const getUniqueObjectList = <T>(array: T[], key: keyof T): T[] =>
  Array.from(new Map(array.map((item) => [item[key], item])).values());

export const getUniqueSetList = <T>(array: T[]): T[] =>
  Array.from(new Set(array));

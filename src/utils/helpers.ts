import { FileWithPath } from "@mantine/dropzone";

import { getCurrentTimestamp } from "@/utils/date";

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

export const getObjectValueCount = <T extends Record<string, unknown>>(
  obj: T
): number =>
  Object.values(obj).filter((value: unknown) =>
    Array.isArray(value)
      ? value.length > 0
      : value !== null && value !== undefined && value !== ""
  ).length;

export const getInsertedArray = <T>(
  originalArray: T[],
  index: number,
  arrayToInsert: T[]
): T[] => [
  ...originalArray.slice(0, index),
  ...arrayToInsert,
  ...originalArray.slice(index),
];

export const getRandomArrayIdx = <T>(array: T[]): number => {
  if (array.length === 0) {
    return 0;
  }
  return Math.floor(Math.random() * array.length);
};

export const getRandomArrayElement = <T>(array: T[]): T | null =>
  array[getRandomArrayIdx(array)];

//#endregion  //*======== Cache ===========

export type CachedData<T> = {
  cachedAt: number;
  data: T;
};

export const createCachedObject = <T>(data: T): CachedData<T> => ({
  cachedAt: getCurrentTimestamp(),
  data,
});

//#endregion  //*======== Cache ===========

//#endregion  //*======== Strings ===========

export const getStringWithoutAffix = (
  str: string,
  affix: string,
  isPrefix = true
): string => {
  if (
    !str ||
    !affix ||
    str.length < affix.length ||
    (isPrefix && !str.startsWith(affix)) ||
    (!isPrefix && !str.endsWith(affix))
  ) {
    return str;
  }
  return isPrefix
    ? str.substring(affix.length)
    : str.substring(0, str.length - affix.length);
};

export const getReplacedStringDelimiter = <T extends string>(
  str: T,
  oldDelimiter: string,
  newDelimiter: string
): T => {
  if (str && str.includes(oldDelimiter)) {
    return str.split(oldDelimiter).join(newDelimiter) as T;
  }
  return str;
};

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

/**
 * @title Title-case text transformation
 * @description This should only be used when CSS styling is not applicable
 */
export const toTitleCase = (str: string) =>
  str.replace(
    /(^\w|\s\w)(\S*)/g,
    (_, m1, m2) => m1.toUpperCase() + m2.toLowerCase()
  );

//#endregion  //*======== Strings ===========

export const getInitialType = <T extends U, U>(extendedObj: T): U => {
  const initialObj: U = {} as U;
  for (const key in extendedObj) {
    if (Object.prototype.hasOwnProperty.call(extendedObj, key)) {
      initialObj[key as unknown as keyof U] = extendedObj[
        key as keyof T
      ] as unknown as U[keyof U];
    }
  }
  return initialObj;
};

export const getImageUrl = (file: FileWithPath) => {
  const imageUrl = URL.createObjectURL(file);
  return imageUrl;
};

export const getImageBase64 = async (file: FileWithPath) => {
  const toBase64 = (file: FileWithPath) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  try {
    const base64Image = await toBase64(file);
    return base64Image;
  } catch (error) {
    console.error(error);
  }
};

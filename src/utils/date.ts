export const addYears = (date: string | number | Date, years: number) => {
  const curDate = new Date(date);
  curDate.setFullYear(curDate.getFullYear() + years);
  return curDate;
};

export const getTimestampAgeInDays = (unixTimestamp: number): number => {
  const oneDayInMilliseconds = 24 * 60 * 60 * 1000; // 1 day in milliseconds
  const now = Date.now();
  const differenceInMilliseconds = now - unixTimestamp * 1000;
  const ageInDays = Math.floor(differenceInMilliseconds / oneDayInMilliseconds);
  return Math.max(ageInDays, 0);
};

export const getCurrentTimestamp = () => Math.floor(Date.now() / 1000);

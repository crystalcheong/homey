export const addYears = (date: string | number | Date, years: number) => {
  const curDate = new Date(date);
  curDate.setFullYear(curDate.getFullYear() + years);
  return curDate;
};

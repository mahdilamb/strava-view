export const yearToSpan = (year: number): [number, number] => {
  const before = new Date(year + 1, 0, 1, 0, 0, 0);
  const after = new Date(year, 0, 1, 0, 0, 0);
  return [after.getTime(), before.getTime()];
};

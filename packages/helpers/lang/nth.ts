import isString from './isString';

export const nth = <T extends string | unknown[]>(
  offset: number,
  list: T,
): T => {
  const idx = offset < 0 ? list.length + offset : offset;
  const result = isString(list) ? list.charAt(idx) : list[idx];
  return result as T;
};

export default nth;

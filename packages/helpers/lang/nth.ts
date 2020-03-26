import isString from './isString';

export const nth = (offset: any, list: any) => {
  const idx = offset < 0 ? list.length + offset : offset;
  return isString(list) ? list.charAt(idx) : list[idx];
};

export default nth;

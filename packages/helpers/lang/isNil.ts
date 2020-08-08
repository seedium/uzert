import isUndefined from './isUndefined';

const isNil = (obj: any): obj is null | undefined =>
  isUndefined(obj) || obj === null;

export default isNil;

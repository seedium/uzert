import isUndefined from './isUndefined';

const isNil = (obj: unknown): obj is null | undefined =>
  isUndefined(obj) || obj === null;

export default isNil;

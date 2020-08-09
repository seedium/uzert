const isUndefined = (obj: unknown): obj is undefined =>
  typeof obj === 'undefined';

export default isUndefined;

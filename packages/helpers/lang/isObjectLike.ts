const isObjectLike = (value: unknown): value is object => {
  return typeof value === 'object' && value !== null;
};

export default isObjectLike;

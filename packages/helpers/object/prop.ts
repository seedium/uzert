import path from './path';

export const prop = <T = any>(p: string, separator = ':') => (
  obj: any,
): T => {
  const paths = p.split(separator);

  return path(paths, obj);
};

export default prop;

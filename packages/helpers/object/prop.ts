import path from './path';

export const prop = <T = any>(p: string, separator: string = ':') => (obj: any): T => {
  const paths = p.split(separator);

  return path(paths, obj);
};

export default prop;

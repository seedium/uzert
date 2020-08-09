import path from './path';

export const prop = <T = unknown>(p: string, separator = ':') => (
  obj: Record<string, unknown>,
): T => {
  const paths = p.split(separator);

  return path(paths, obj);
};

export default prop;

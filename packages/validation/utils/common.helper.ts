import { isString } from '@uzert/helpers';

export const capitalize = (s: string) => {
  if (!isString(s)) {
    return s;
  }

  return s.charAt(0).toUpperCase() + s.slice(1);
};

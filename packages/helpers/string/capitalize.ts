import { isString } from '../lang';

const capitalize = (str: string): string => {
  if (!isString(str)) {
    return '';
  }
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export default capitalize;

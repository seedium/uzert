import isPlainObject from '../lang/isPlainObject';
import isString from '../lang/isString';
import merge from '../object/merge';

const trimFields = <T = any>(data: T): T => {
  if (!isPlainObject(data)) {
    return data;
  }

  const copy = merge({}, data);

  for (const key in copy) {
    if (copy.hasOwnProperty(key) && isString(copy[key])) {
      copy[key] = (copy[key] as string).trim();
    }
  }

  return copy as T;
};

export default trimFields;

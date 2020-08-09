import isPlainObject from '../lang/isPlainObject';
import isString from '../lang/isString';
import merge from '../object/merge';

const trimFields = <T = unknown>(data: T): T => {
  if (!isPlainObject(data)) {
    return data;
  }

  const copy = merge({}, data);

  for (const key in copy) {
    const property = copy[key];
    if (copy.hasOwnProperty(key) && isString(property)) {
      copy[key] = property.trim();
    }
  }

  return copy as T;
};

export default trimFields;

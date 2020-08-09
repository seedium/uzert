import isPlainObject from '../lang/isPlainObject';
import copy from './copy';

export const merge = <T = Record<string, unknown>>(
  target: Partial<T>,
  source: Partial<T>,
): T => {
  if (isPlainObject(source)) {
    source = copy(source);
  }

  // Iterate through `source` properties and if an `Object` set property to merge of `target` and `source` properties
  for (const key of Object.keys(source)) {
    if (isPlainObject(source[key])) {
      source[key] = {
        ...source[key],
        ...merge(target[key], source[key]),
      };
    }
  }

  // Join `target` and modified `source`
  Object.assign(target || {}, source);
  return target as T;
};

export default merge;

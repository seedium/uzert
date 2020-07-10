import isPlainObject from '../lang/isPlainObject';
import copy from './copy';

export const merge = <T = any>(target: Partial<T>, source: Partial<T>): T => {
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

function getProperty<T, K extends keyof T>(o: T, propertyName: K): T[K] {
  return o[propertyName]; // o[propertyName] is of type T[K]
}

const test = getProperty({ test: 'foo' }, 'test');

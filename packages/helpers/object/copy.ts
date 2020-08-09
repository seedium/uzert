import isPlainObject from '../lang/isPlainObject';

const copy = <T = object>(value: object): T => {
  if (!isPlainObject(value)) {
    return {} as T;
  }

  return JSON.parse(JSON.stringify(value));
};

export default copy;

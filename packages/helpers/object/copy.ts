import isPlainObject from '../lang/isPlainObject';

const copy = (value: any): any => {
  const result = {};

  if (!isPlainObject(value)) {
    return result;
  }

  return JSON.parse(JSON.stringify(value));
};

export default copy;

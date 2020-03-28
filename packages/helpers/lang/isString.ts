import getTag from '../internal/getTag';

const isString = (value: any): value is string => {
  const type = typeof value;

  return (
    type === 'string' ||
    (type === 'object' && value !== null && !Array.isArray(value) && getTag(value) === '[object String]')
  );
};

export default isString;

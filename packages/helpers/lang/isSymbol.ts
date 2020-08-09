import getTag from '../internal/getTag';

const isSymbol = (value: unknown): value is symbol => {
  const type = typeof value;
  return (
    type == 'symbol' ||
    (type === 'object' && value != null && getTag(value) == '[object Symbol]')
  );
};

export default isSymbol;

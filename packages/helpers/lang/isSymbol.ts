import getTag from '../internal/getTag';

const isSymbol = (value: any): value is Symbol => {
  const type = typeof value;
  return type == 'symbol' || (type === 'object' && value != null && getTag(value) == '[object Symbol]');
};

export default isSymbol;

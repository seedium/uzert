export const uzertIsInteger = function isInteger(n: any) {
  return n << 0 === n;
};

const isInteger = Number.isInteger || uzertIsInteger;

export default isInteger;

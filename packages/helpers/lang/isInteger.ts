export const uzertIsInteger = function isInteger(n: unknown): boolean {
  return (n as number) << 0 === n;
};

const isInteger = Number.isInteger || uzertIsInteger;

export default isInteger;

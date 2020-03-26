const isInteger =
  Number.isInteger ||
  // tslint:disable-next-line
  function isInteger(n) {
    return n << 0 === n;
  };

export default isInteger;

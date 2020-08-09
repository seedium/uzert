import * as crypto from 'crypto';

const getHash = (str: string, salt: string, algorithm = 'sha512'): string => {
  const hash = crypto.createHmac(algorithm, salt);
  hash.update(str);
  return hash.digest('hex');
};

export default getHash;

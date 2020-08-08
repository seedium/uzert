import * as crypto from 'crypto';

const getSalt = (length = 16): string => {
  return crypto
    .randomBytes(Math.ceil(length / 2))
    .toString('hex')
    .slice(0, length);
};

export default getSalt;

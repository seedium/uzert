import getHash from './getHash';

const verifyHash = (
  origin: string,
  userHash: string,
  salt: string,
  algorithm = 'sha512',
): boolean => {
  const hash = getHash(origin, salt, algorithm);

  return hash === userHash;
};

export default verifyHash;

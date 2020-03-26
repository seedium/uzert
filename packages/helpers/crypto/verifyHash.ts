import getHash from './getHash';

const verifyHash = (origin: string, userHash: string, salt: string) => {
  const hash = getHash(origin, salt);

  return hash === userHash;
};

export default verifyHash;

import { expect } from 'chai';
import { getHash, getSalt, verifyHash } from '../crypto';

describe('Crypto helpers', () => {
  describe('getHash', () => {
    const randomString = 'test any string';
    const randomSalt = 'random salt';
    it('should return hashed string without specifying algorithm', () => {
      const hash = getHash(randomString, randomSalt);
      expect(typeof hash).eq('string');
    });
    it('should return hashed string with not default algorithm', () => {
      const hash = getHash(randomString, randomSalt, 'sha256');
      expect(typeof hash).eq('string');
    });
  });
  describe('getSalt', () => {
    it('should generate random string with default 16 length', () => {
      const salt = getSalt();
      expect(salt).length(16);
    });
    it('should generate random string with any length', () => {
      const length = 32;
      const salt = getSalt(length);
      expect(salt).length(length);
    });
  });
  describe('verifyHash', () => {
    const randomString = 'string to be hashed';
    const salt = getSalt();
    const hash = getHash(randomString, salt);
    it('should verify hash with default algorithm', () => {
      const result = verifyHash(randomString, hash, salt);
      expect(result).to.be.true;
    });
    it('should not verify not equal strings', () => {
      const anotherRandomString = 'another string to be hashed';
      const result = verifyHash(anotherRandomString, hash, salt);
      expect(result).to.be.false;
    });
    it('should verify with different algorithm', () => {
      const algorithm = 'sha256';
      const hashSha256 = getHash(randomString, salt, algorithm);
      const result = verifyHash(randomString, hashSha256, salt, algorithm);
      expect(result).to.be.true;
    });
  });
});

import { expect } from 'chai';
import getTag from '../internal/getTag';

describe('Internal helpers', () => {
  describe('getTag', () => {
    it('should return [object Undefined] if undefined', () => {
      const result = getTag(undefined);
      expect(result).eq('[object Undefined]');
    });
    it('should return [object Null] if null', () => {
      const result = getTag(null);
      expect(result).eq('[object Null]');
    });
    it('should return [object Object] if object', () => {
      const result = getTag({});
      expect(result).eq('[object Object]');
    });
    it('should return [object Array] if array', () => {
      const result = getTag([]);
      expect(result).eq('[object Array]');
    });
  });
});

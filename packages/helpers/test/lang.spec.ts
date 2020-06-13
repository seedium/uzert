import { expect } from 'chai';
import * as sinon from 'sinon';
import { isFunction, isNil, isObjectLike, isPlainObject, isString, isUndefined, nth } from '../lang';
import { uzertIsInteger as isInteger } from '../lang/isInteger';

describe('Lang helpers', () => {
  describe('isFunction', () => {
    it('should return true if is function', () => {
      const result = isFunction(() => {});
      expect(result).to.be.true;
    });
    it('should return false if is other', () => {
      const result = isFunction({});
      expect(result).to.be.false;
    });
  });
  describe('isInteger', () => {
    it('should return true if integer use native implementation', () => {
      const result = isInteger(5);
      expect(result).to.be.true;
    });
    it('should return false if float', () => {
      const result = isInteger(5.04);
      expect(result).to.be.false;
    });
  });
  describe('isUndefined', () => {
    it('should return true if undefined', () => {
      const result = isUndefined(undefined);
      expect(result).to.be.true;
    });
    it('should return false if null', () => {
      const result = isUndefined(null);
      expect(result).to.be.false;
    });
  });
  describe('isNil', () => {
    it('should return true if null', () => {
      const result = isNil(null);
      expect(result).to.be.true;
    });
    it('should return true if undefined', () => {
      const result = isNil(undefined);
      expect(result).to.be.true;
    });
    it('should return false if any other', () => {
      const result = isNil(false);
      expect(result).to.be.false;
    });
  });
  describe('isObjectLike', () => {
    class Test {}
    it('should return true if class', () => {
      const test = new Test();
      const result = isObjectLike(test);
      expect(result).to.be.true;
    });
    it('should return true if plan object', () => {
      const result = isObjectLike({});
      expect(result).to.be.true;
    });
    it('should return false if any other', () => {
      const result1 = isObjectLike('');
      const result2 = isObjectLike(false);
      expect(result1).to.be.false;
      expect(result2).to.be.false;
    });
  });
  describe('isPlainObject', () => {
    afterEach(() => {
      sinon.restore();
    });
    class Test {}
    it('should return true when plain object', () => {
      const result = isPlainObject({});
      expect(result).to.be.true;
    });
    it('should return false if class', () => {
      const result = isPlainObject(Test);
      expect(result).to.be.false;
    });
    it('should return true if get prototype of object return null', () => {
      sinon.stub(Object, 'getPrototypeOf').returns(null);
      const result = isPlainObject({});
      expect(result).to.be.true;
    });
  });
  describe('isString', () => {
    it('should return true if string', () => {
      const result = isString('');
      expect(result).to.be.true;
    });
    it('should return false is any other', () => {
      const types = [false, true, {}, [], null, undefined];
      types.forEach((type) => {
        const result = isString(type);
        expect(result).to.be.false;
      });
    });
  });
  describe('nth', () => {
    const arr = [1, 2, 3, 4, 5];
    it('should return element from the back', () => {
      const result = nth(-3, arr);
      expect(result).eq(arr[2]);
    });
    it('should return element from the begining', () => {
      const result = nth(3, arr);
      expect(result).eq(arr[3]);
    });
    it('if string should return char', () => {
      const str = '12345';
      const result = nth(3, str);
      expect(result).eq('4');
    });
  });
});

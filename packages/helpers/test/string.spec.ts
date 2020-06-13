import { expect } from 'chai';
import { eraseExtension, isEmail, isJson, trimFields, validatePassword } from '../string';

describe('String', () => {
  describe('eraseExtension', () => {
    const path = '/example/path/to/file';
    it('should erase extension and return without it', () => {
      const str = `${path}.js`;
      const result = eraseExtension(str);
      expect(result).eq(path);
    });
    it('should not erase any charters if extension not exists', () => {
      const result = eraseExtension(path);
      expect(result).eq(path);
    });
  });
  describe('isEmail', () => {
    it('should validate email', () => {
      const result = isEmail('test@gmail.com');
      expect(result).to.be.true;
    });
    it('should not validate email', () => {
      const result = isEmail('test@gmail');
      expect(result).to.be.false;
    });
  });
  describe('isJson', () => {
    it('should return true if valid json', () => {
      const json = JSON.stringify({ some: 'value' });
      const result = isJson(json);
      expect(result).to.be.true;
    });
    it('should return false if not string', () => {
      // @ts-expect-error
      const result = isJson({});
      expect(result).to.be.false;
    });
    it('should return false if string is not json', () => {
      const json = '{"some: "value"}';
      const result = isJson(json);
      expect(result).to.be.false;
    });
  });
  describe('trimFields', () => {
    it('should not trim fields if source not a plain object', () => {
      class Test {}
      const test = new Test();
      const trimmed = trimFields(test);
      expect(trimmed).eq(test);
    });
    describe('when source is plain object', () => {
      const firstField = 'bar';
      const secondField = 'foo';
      const sourceWithSpaces = {
        firstField: `  ${firstField}  `,
        secondField: `  ${secondField} `,
      };
      it('should trim all fields', () => {
        const trimmed = trimFields(sourceWithSpaces);
        expect(trimmed.firstField).eq(firstField);
        expect(trimmed.secondField).eq(secondField);
      });
      it('should return new object', () => {
        const trimmed = trimFields(sourceWithSpaces);
        expect(trimmed).not.eq(sourceWithSpaces);
      });
    });
  });
  describe('validatePassword', () => {
    it('should not validate password with spaces', () => {
      const invalidPassword = 'somepassword ';
      const result = validatePassword(invalidPassword);
      expect(result).to.be.false;
    });
    it('should success validate', () => {
      const password = '12345678';
      const result = validatePassword(password);
      expect(result).to.be.true;
    });
    it('should validate password with default min length 8', () => {
      const invalidPassword = '1234567';
      const result = validatePassword(invalidPassword);
      expect(result).to.be.false;
    });
    describe('when using options', () => {
      const invalidPassword = '12345678';
      it('should validate min length', () => {
        const result = validatePassword(invalidPassword, {
          minLength: 10,
        });
        expect(result).to.be.false;
      });
      it('should validate upper case', () => {
        const validPassword = invalidPassword + 'A';
        const resultInvalidPassword = validatePassword(invalidPassword, {
          upperCase: true,
        });
        const resultValidPassword = validatePassword(validPassword, {
          upperCase: true,
        });
        expect(resultInvalidPassword).to.be.false;
        expect(resultValidPassword).to.be.true;
      });
      it('should validate including numbers', () => {
        const invalidPasswordNumbers = 'somepassword';
        const validPassword = invalidPassword;
        const resultInvalidPassword = validatePassword(invalidPasswordNumbers, {
          numberCase: true,
        });
        const resultValidPassword = validatePassword(validPassword, {
          numberCase: true,
        });
        expect(resultInvalidPassword).to.be.false;
        expect(resultValidPassword).to.be.true;
      });
      it('should validate including symbols', () => {
        const validPassword = invalidPassword + '%';
        const resultInvalidPassword = validatePassword(invalidPassword, {
          symbol: true,
        });
        const resultValidPassword = validatePassword(validPassword, {
          symbol: true,
        });
        expect(resultInvalidPassword).to.be.false;
        expect(resultValidPassword).to.be.true;
      });
    });
  });
});

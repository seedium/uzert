import * as path from 'path';
import * as sinon from 'sinon';
import { expect } from 'chai';
import * as proxyquire from 'proxyquire';
import { Config } from '../config';
import configFile from './configs/test';
import configObjectFile from './configs/object_config';

describe('Config', async () => {
  let config: Config;
  afterEach(() => {
    if (config) {
      config.dispose();
    }
  });
  describe('Load default configs', () => {
    beforeEach(async () => {
      const provider = Config.boot({
        path: path.join(__dirname, 'configs'),
      });
      config = await provider.useFactory();
    });
    it('should load configs from provided folder', async () => {
      const configObject = configFile();
      expect(config).property('_stores').property('test').deep.eq(configObject);
    });
    it('should load pure object config', () => {
      const configObject = configObjectFile;
      expect(config).property('_stores').property('object_config').deep.eq(configObject);
    });
    it('should miss other type of export default', () => {
      expect(config).property('_stores').not.property('class_config');
    });
  });
  it('should load configs with custom pattern', async () => {
    const customConfigPattern = await Config.boot({
      path: path.join(__dirname, 'custom_patterns'),
      pattern: '*.config.ts',
    }).useFactory();
    expect(customConfigPattern).property('_stores').property('test_custom.config');
    expect(customConfigPattern).property('_stores').not.property('test');
  });
  it('error in glob should be rejected', async () => {
    const testErrorGlob = new Error('test error glob');
    const stubGlob = sinon.stub().callsFake((path, cb) => cb(testErrorGlob));
    const { Config } = proxyquire('../config', {
      glob: stubGlob,
    });
    try {
      await Config.boot({
        path: path.join(__dirname, 'configs'),
      }).useFactory();
    } catch (e) {
      expect(e).eq(testErrorGlob);
      return;
    }
    throw new Error('error from glob should be processed');
  });
  describe('Resolving', () => {
    beforeEach(async () => {
      const provider = Config.boot({
        path: path.join(__dirname, 'configs'),
      });
      config = await provider.useFactory();
    });
    describe('env values', () => {
      beforeEach(() => {
        process.env.UZERT_CONFIG_TEST_STRING = 'some_string';
        process.env.UZERT_CONFIG_TEST_FALSE = 'false';
        process.env.UZERT_CONFIG_TEST_TRUE = 'true';
      });
      afterEach(() => {
        delete process.env.UZERT_CONFIG_TEST_STRING;
        delete process.env.UZERT_CONFIG_TEST_FALSE;
        delete process.env.UZERT_CONFIG_TEST_TRUE;
      });
      it('should resolve `string` value', () => {
        const value = config.env('UZERT_CONFIG_TEST_STRING');
        expect(value).eq('some_string');
      });
      it('should resolve `false` value', () => {
        const value = config.env('UZERT_CONFIG_TEST_FALSE');
        expect(value).is.false;
      });
      it('should resolve `true` value', () => {
        const value = config.env('UZERT_CONFIG_TEST_TRUE');
        expect(value).is.true;
      });
      it('should resolve default value if env not found', () => {
        const value = config.env('UZERT_CONFIG_TEST_UNKNOWN', 'default_value');
        expect(value).eq('default_value');
      });
    });
    describe('config values', () => {
      it('should resolve `string` value', () => {
        expect(config.get('test:string')).eq('value');
      });
      it('should resolve `true` value', () => {
        expect(config.get('test:testTrue')).is.true;
      });
      it('should resolve `false` value', () => {
        expect(config.get('test:testFalse')).is.false;
      });
      it('should resolve `undefined` value', () => {
        expect(config.get('test:undefined')).is.undefined;
      });
      it('should resolve `undefined` if value not found', () => {
        expect(config.get('test:unknown')).is.undefined;
      });
      it('should resolve default value if value not found', () => {
        expect(config.get('test:unknown', 'test_string')).eq('test_string');
      });
      it('should get nested `string` key', () => {
        expect(config.get('test:nested:string')).eq('value');
      });
      it('should get nested `false` key', () => {
        expect(config.get('test:nested:testFalse')).is.false;
      });
      it('should get nested `undefined` key', () => {
        expect(config.get('test:nested:undefined')).is.undefined;
      });
      it('if nested key not found should return undefined', () => {
        expect(config.get('test:nested:unknown')).is.undefined;
      });
    });
  });
});

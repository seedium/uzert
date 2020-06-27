import * as path from 'path';
import { expect } from 'chai';
import { Config } from '../config';
import configFile from './configs/test';

describe('Config', async () => {
  let config: Config;
  beforeEach(async () => {
    const provider = Config.boot({
      path: path.join(__dirname, 'configs'),
      pattern: '*.ts',
    });
    config = await provider.useFactory();
  });
  afterEach(() => {
    config.dispose();
  });
  it('should load configs from provided folder', async () => {
    const configObject = configFile();
    expect(config).property('_stores').property('test').deep.eq(configObject);
  });
  describe('Resolving values', () => {
    it('should resolve string value', () => {
      expect(config.get('test:string')).eq('value');
    });
    it('should resolve true value', () => {
      expect(config.get('test:testTrue')).is.true;
    });
    it('should resolve false value', () => {
      expect(config.get('test:testFalse')).is.false;
    });
    it('should resolve undefined value', () => {
      expect(config.get('test:undefined')).is.undefined;
    });
    it('should resolve undefined if value not found', () => {
      expect(config.get('test:unknown')).is.undefined;
    });
    it('should resolve default value if value not found', () => {
      expect(config.get('test:unknown', 'test_string')).eq('test_string');
    });
    it('should get nested string key', () => {
      expect(config.get('test:nested:string')).eq('value');
    });
    it('should get nested false key', () => {
      expect(config.get('test:nested:testFalse')).is.false;
    });
    it('should get nested undefined key', () => {
      expect(config.get('test:nested:undefined')).is.undefined;
    });
    it('if nested key not found should return undefined', () => {
      expect(config.get('test:nested:unknown')).is.undefined;
    });
  });
});

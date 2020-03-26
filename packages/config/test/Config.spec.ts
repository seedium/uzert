import * as path from 'path';
import { expect } from 'chai';
import Config from '../src/index';

describe('Config', async () => {

  afterEach(() => {
    Config.unBoot();
  });

  it('should not be booted', async () => {
    expect(Object.keys(Config.stores)).length(0);
  });

  it('should load from default path', async () => {
    await Config.boot({
      useAbsolute: false,
    });
    expect(Object.keys(Config.stores)).length(1);
    expect(Config.stores).property('testDefault').property('foo').eq('bar');
  });

  it('should load from custom path', async () => {
    await Config.boot({
      basePath: path.resolve(process.cwd(), 'test', 'custom', 'path'),
      pattern: '*.ts',
      useAbsolute: false,
    });
    expect(Object.keys(Config.stores)).length(1);
  });

  it('should resolve with default base folder for absolute paths', async () => {
    await Config.boot({
      basePath: 'app/Config',
      pattern: '*.ts',
    });
  });

  describe('Resolving values', () => {
    beforeEach(async () => {
      await Config.boot({
        basePath: path.resolve(process.cwd(), 'test', 'custom', 'path'),
        pattern: '*.ts',
        useAbsolute: false,
      });
    });

    it('should resolve string value', () => {
      expect(Config.get('testCustom:string')).eq('value');
    });

    it('should resolve false value', () => {
      expect(Config.get('testCustom:testFalse')).eq(false);
    });

    it('should resolve undefined value', () => {
      expect(Config.get('testCustom:undefined')).is.undefined;
    });

    it('should resolve undefined if value not found', () => {
      expect(Config.get('testCustom:unknown')).is.undefined;
    });

    it('should get nested string key', () => {
      expect(Config.get('testCustom:nested:string')).eq('value');
    });

    it('should get nested false key', () => {
      expect(Config.get('testCustom:nested:false')).eq(false);
    });

    it('should get nested undefined key', () => {
      expect(Config.get('testCustom:nested:undefined')).is.undefined;
    });

    it('should get nested string key', () => {
      expect(Config.get('testCustom:nested:unknown')).is.undefined;
    });

  });

});

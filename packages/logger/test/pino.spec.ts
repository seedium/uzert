import * as path from 'path';
import Config from '@uzert/config';
import Log from '../src';

describe('Pino default', function() {
  before(async () => {
    await Config.boot({
      basePath: path.resolve(process.cwd(), 'test', 'config_default'),
      pattern: '*.ts',
      useAbsolute: false,
    });
    await Log.boot();
  });

  after(async () => {
    await Promise.all([Config.unBoot(), Log.unBoot()]);
  });

  it('should output "Hello world"', () => {
    Log.pino.info('Hello world');
  });

  it('should output error', () => {
    Log.pino.error(new Error('error'));
  });
});

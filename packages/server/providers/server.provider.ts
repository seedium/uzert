import App, { IApplication } from '@uzert/app';
import { IProvider } from '@uzert/core';
import Config from '@uzert/config';
import Logger from '@uzert/logger';
// errors
import { ServerNotBootedError } from '../errors';

let startDate: number;

const totalBegin = new Date().getTime();

class Server implements IProvider {
  protected app: IApplication | null = null;

  public async boot() {
    startDate = new Date().getTime();
    this.app = await App.run();
  }

  public async run() {
    try {
      if (!this.app) {
        throw new ServerNotBootedError();
      }

      const port = Config.get('app:port');

      await this.app.listen(port, '0.0.0.0');

      const finishedDate = new Date().getTime();
      Logger.pino.trace(`Successfully initialization Server: ${finishedDate - startDate}ms`);
      const totalEnd = new Date().getTime();
      Logger.pino.info(`The system started in ${totalEnd - totalBegin} milliseconds`);

      return this.app;
    } catch (err) {
      Logger.pino.error(err);
    }
  }
}

export default new Server();

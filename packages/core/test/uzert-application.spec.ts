import { expect } from 'chai';
import * as sinon from 'sinon';
import { MockedHttpAdapter } from './utils';
import { UzertApplication } from '../uzert-application';
import { UzertContainer } from '../injector';

describe('UzertApplication', () => {
  let app: UzertApplication<MockedHttpAdapter>;
  let stubHttpAdapterListen: sinon.SinonStub;
  beforeEach(() => {
    const container = new UzertContainer();
    app = new UzertApplication<MockedHttpAdapter>(container, new MockedHttpAdapter());
    stubHttpAdapterListen = sinon.stub(app.httpAdapter, 'listen');
  });
  afterEach(() => {
    sinon.restore();
  });
  describe('initialization', () => {
    it('should init', async () => {
      expect(app).property('isInitialized').is.false;
      await app.init();
      expect(app).property('isInitialized').is.true;
    });
    it('should register router', async () => {
      const stubRegisterRouter = sinon.stub((app as any)._routerResolver, 'registerRoutes');
      await app.init();
      expect(stubRegisterRouter.calledOnce).to.be.true;
    });
    it('if initialized should return self', async () => {
      const stubRegisterRouter = sinon.stub((app as any)._routerResolver, 'registerRoutes');
      await app.init();
      const result = await app.init();
      expect(result).eq(app);
      expect(stubRegisterRouter.calledOnce).to.be.true;
    });
  });
  describe('listening', () => {
    it('should call `init` method', async () => {
      const stubInit = sinon.stub(app, 'init');
      await app.listen();
      expect(stubInit.calledOnce).to.be.true;
    });
    it('should call `listen` of http adapter', async () => {
      await app.listen();
      expect(stubHttpAdapterListen.calledOnce).to.be.true;
    });
    it('if initialized should return self', async () => {
      await app.listen();
      const result = await app.listen();
      expect(result).eq(app);
      expect(stubHttpAdapterListen.calledOnce).to.be.true;
    });
  });
});

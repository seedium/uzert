import * as chai from 'chai';
import * as sinonChai from 'sinon-chai';
import * as sinon from 'sinon';
import { UzertApplicationContext } from '../uzert-application-context';
import { InstanceLoader, UzertContainer } from '../injector';
import { ShutdownSignal } from '../enums';
import {
  OnAppShutdown,
  OnBeforeAppShutdown,
  OnDispose,
  OnInit,
} from '../interfaces/hooks';

chai.use(sinonChai);
const expect = chai.expect;
const delay = (value: number) =>
  new Promise((resolve) => setTimeout(resolve, value));

class TestModule {}
describe('Uzert application context', () => {
  let ctx: UzertApplicationContext;
  let instanceLoader: InstanceLoader;
  let testModuleToken: string;
  beforeEach(async () => {
    const container = new UzertContainer();
    ctx = new UzertApplicationContext(container);
    await container.addModule(TestModule, []);
    testModuleToken = await container.getModuleToken(TestModule);
    instanceLoader = new InstanceLoader(container);
  });
  afterEach(() => {
    sinon.restore();
  });
  describe('initialization', () => {
    it('should init context', async () => {
      expect(ctx).property('isInitialized').is.false;
      await ctx.init();
      expect(ctx).property('isInitialized').is.true;
    });
    it('when context already init should return instance', async () => {
      await ctx.init();
      const result = await ctx.init();
      expect(result).eq(ctx);
    });
    it('should call init hook', async () => {
      const stubCallInitHook = sinon.stub(ctx, <any>'callInitHook');
      await ctx.init();
      expect(stubCallInitHook).calledOnce;
    });
    it('should call onInit in each provider', async () => {
      class TestProvider implements OnInit {
        public onInit(): any {}
      }
      const stubProviderOnInit = sinon.stub(TestProvider.prototype, 'onInit');
      ctx.container.addProvider(TestProvider, testModuleToken);
      await instanceLoader.createInstancesOfDependencies();
      await ctx.init();
      expect(stubProviderOnInit).calledOnce;
    });
  });
  describe('closing', () => {
    it('should dispose context when close', async () => {
      const spyDispose = sinon.spy(ctx, <any>'dispose');
      await ctx.close();
      expect(spyDispose.calledOnce).to.be.true;
    });
    it('should start shutdown cycle', async () => {
      const stubStartShutdownCycle = sinon.stub(ctx, <any>'startShutdownCycle');
      await ctx.close();
      expect(stubStartShutdownCycle).calledOnce;
    });
    describe('when shutdown hooks is', () => {
      afterEach(() => {
        process.removeAllListeners();
      });
      it('enabled, should unsubscribe from them', async () => {
        const spyProcessRemoveListener = sinon.spy(process, 'removeListener');
        ctx.enableShutdownHooks();
        await ctx.close();
        (ctx as any).activeShutdownSignals.forEach((signal) => {
          expect(spyProcessRemoveListener).calledWithExactly(
            signal,
            (ctx as any).shutdownCleanupRef,
          );
        });
      });
      it('should miss unsubscribing', async () => {
        const spyUnsubscribeFromProcessSignals = sinon.spy(
          (ctx as any).activeShutdownSignals,
          <any>'forEach',
        );
        await ctx.close();
        expect(spyUnsubscribeFromProcessSignals).not.called;
      });
    });
    describe('shutdown hooks', () => {
      afterEach(() => {
        process.removeAllListeners();
      });
      const defaultSignals = Object.keys(ShutdownSignal).filter(
        (signal) => signal !== 'UNCAUGHT_EXCEPTION',
      );
      defaultSignals.push(ShutdownSignal.UNCAUGHT_EXCEPTION);
      it('by default should be disabled', async () => {
        const stubListenToShutdownSignals = sinon.stub(
          ctx,
          <any>'listenToShutdownSignals',
        );
        await ctx.init();
        expect(stubListenToShutdownSignals).not.called;
      });
      it('should subscribe on default shutdown signals', () => {
        ctx.enableShutdownHooks();
        const subscribedSignals = (ctx as any).activeShutdownSignals;
        expect(subscribedSignals).to.eql(defaultSignals);
      });
      it('should subscribe only on passed signals', () => {
        const shutdownSignals = ['SIGINT', 'SIGTERM'];
        ctx.enableShutdownHooks(shutdownSignals);
        const subscribedSignals = (ctx as any).activeShutdownSignals;
        expect(subscribedSignals).to.eql(shutdownSignals);
      });
      it('should subscribe on process events', () => {
        const stubProcessOn = sinon.stub(process, 'on');
        ctx.enableShutdownHooks();
        defaultSignals.forEach((signal) => {
          expect(stubProcessOn).calledWithExactly(
            signal,
            (ctx as any).shutdownCleanupRef,
          );
        });
      });
      describe('cleanup function should', () => {
        beforeEach(() => {
          sinon.stub(process, 'kill');
          ctx.enableShutdownHooks();
        });
        it('remove listener from the process', () => {
          const spyRemoveListener = sinon.spy(process, 'removeListener');
          process.emit('SIGINT', 'SIGINT');
          defaultSignals.forEach((signal) => {
            expect(spyRemoveListener).calledWithExactly(
              signal,
              (ctx as any).shutdownCleanupRef,
            );
          });
        });
        it('start shutdown cycle', () => {
          const stubShutdownCycle = sinon.stub(ctx, <any>'startShutdownCycle');
          process.emit('SIGINT', 'SIGINT');
          expect(stubShutdownCycle).calledOnce;
        });
        it('if error occurred in shutdown cycle should exit with code 1', async () => {
          const stubProcessExit = sinon.stub(process, 'exit');
          sinon.stub(ctx, <any>'startShutdownCycle').rejects(new Error('test'));
          process.emit('SIGINT', 'SIGINT');
          /* TODO refactor to listening `exit` event and return promise when event will be emitted */
          /* need a little delay for properly catching process exit */
          await delay(100);
          expect(stubProcessExit).calledOnceWithExactly(1);
        });
        describe('before app shutdown', () => {
          let stubProviderOnBeforeAppShutdown: sinon.SinonStub;
          beforeEach(async () => {
            class TestProvider implements OnBeforeAppShutdown {
              public onBeforeAppShutdown(): any {}
            }
            stubProviderOnBeforeAppShutdown = sinon.stub(
              TestProvider.prototype,
              'onBeforeAppShutdown',
            );
            ctx.container.addProvider(TestProvider, testModuleToken);
            await instanceLoader.createInstancesOfDependencies();
          });
          it('should call before app shutdown hook in each provider', async () => {
            await ctx.close();
            expect(stubProviderOnBeforeAppShutdown).calledOnce;
          });
          it('if error occurred should be called with error as a first arg', async () => {
            let mochaHandler: any;
            sinon.stub(process, 'exit');
            const exceptionListeners = process.listeners('uncaughtException');
            if (exceptionListeners.length > 1) {
              mochaHandler = exceptionListeners.shift();
              process.removeListener('uncaughtException', mochaHandler);
            }
            const testError = new Error('test');
            process.emit('uncaughtException', testError);
            expect(stubProviderOnBeforeAppShutdown).calledOnceWithExactly(
              testError,
              undefined,
            );
            if (mochaHandler) {
              process.listeners('uncaughtException').unshift(mochaHandler);
            }
          });
        });
        describe('on app shutdown', () => {
          it('should call shutdown hook in each provider', async () => {
            class TestProvider implements OnAppShutdown {
              public onAppShutdown(): any {}
            }
            const stubProviderOnAppShutdown = sinon.stub(
              TestProvider.prototype,
              'onAppShutdown',
            );
            ctx.container.addProvider(TestProvider, testModuleToken);
            await instanceLoader.createInstancesOfDependencies();
            await ctx.close();
            expect(stubProviderOnAppShutdown).calledOnce;
          });
        });
        it('should call disposing each provider', async () => {
          class TestProvider implements OnDispose {
            public onDispose(): any {}
          }
          const stubProviderOnDispose = sinon.stub(
            TestProvider.prototype,
            'onDispose',
          );
          ctx.container.addProvider(TestProvider, testModuleToken);
          await instanceLoader.createInstancesOfDependencies();
          await ctx.close();
          expect(stubProviderOnDispose).calledOnce;
        });
      });
      it('shutdown cycle should trigger hooks in right order', async () => {
        const spyBeforeShutdownHook = sinon.spy(
          ctx,
          <any>'callBeforeShutdownHook',
        );
        const spyDispose = sinon.spy(ctx, <any>'dispose');
        const spyCallShutdownHook = sinon.spy(ctx, <any>'callShutdownHook');
        const spyCallDisposeHook = sinon.spy(ctx, <any>'callDisposeHook');
        await (ctx as any).startShutdownCycle();
        expect(spyBeforeShutdownHook).calledOnce;
        expect(spyDispose).calledAfter(spyBeforeShutdownHook);
        expect(spyCallShutdownHook).calledAfter(spyDispose);
        expect(spyCallDisposeHook).calledAfter(spyCallShutdownHook);
      });
    });
  });
});

import { expect } from 'chai';
import * as sinon from 'sinon';
import { UzertApplicationContext } from '../uzert-application-context';
import { UzertContainer } from '../injector';

describe('Uzert application context', () => {
  let context: UzertApplicationContext;
  beforeEach(() => {
    const container = new UzertContainer();
    context = new UzertApplicationContext(container);
  });
  afterEach(() => {
    sinon.restore();
  });
  it('should dispose context when close', async () => {
    const spyDispose = sinon.spy(context, <any>'dispose');
    await context.close();
    expect(spyDispose.calledOnce).to.be.true;
  });
  describe('initialization', () => {
    it('should init context', async () => {
      expect(context).property('isInitialized').is.false;
      await context.init();
      expect(context).property('isInitialized').is.true;
    });
    it('when context already init should return instance', async () => {
      await context.init();
      const result = await context.init();
      expect(result).eq(context);
    });
  });
});

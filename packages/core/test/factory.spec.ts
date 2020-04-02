import * as sinon from 'sinon';
import { expect } from 'chai';
import { UzertFactory } from '../uzert-factory';
import { Injectable } from '../decorators';
import { Module } from '../decorators';
import { UzertApplicationContext } from '../uzert-application-context';

describe('Factory', () => {
  @Injectable()
  class TestService {}
  @Module({
    controllers: [],
    providers: [TestService],
  })
  class AppModule {}
  afterEach(() => {
    sinon.restore();
  });

  it('should return application context', async () => {
    const ctx = await UzertFactory.createApplicationContext(AppModule);
    expect(ctx).not.undefined;
    expect(ctx).instanceOf(UzertApplicationContext);
  });

  describe('When working with two context', () => {
    let ctx1: UzertApplicationContext;
    let ctx2: UzertApplicationContext;
    beforeEach(async () => {
      ctx1 = await UzertFactory.createApplicationContext(AppModule);
      ctx2 = await UzertFactory.createApplicationContext(AppModule);
    });
    it('should create new container for each application context', () => {
      expect(ctx1).not.eq(ctx2);
    });
    it('injected classes should be different', async () => {
      const testProvider1 = await ctx1.get(TestService);
      const testProvider2 = await ctx2.get(TestService);
      expect(testProvider1).not.eq(testProvider2);
    });
  });
});

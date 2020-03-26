import { expect } from 'chai';
import App from '../providers/fastify-application.provider';

describe('App', () => {
  it('app should be booted', async () => {
    expect(App.app).is.null;
    await App.boot();
    expect(App.app).is.not.null;
    expect(App.app && App.isReady).is.true;
  });
});

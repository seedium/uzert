import * as chai from 'chai';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import { Config, ConfigModule, ConfigStore } from '../lib';

chai.use(sinonChai);
const expect = chai.expect;

describe('ConfigModule', () => {
  let store: unknown;
  let stubConfigFor: sinon.SinonStub;
  beforeEach(() => {
    store = { foo: 'bar' };
    stubConfigFor = sinon.stub(Config, 'for').returns({
      provide: Config,
      useFactory: () =>
        // @ts-expect-error
        Promise.resolve({
          store,
        }),
    });
  });
  afterEach(() => {
    sinon.restore();
  });
  it('should provide', async () => {
    const configModule = await ConfigModule.for({ path: 'test' });
    expect(configModule)
      .have.property('exports')
      .an('array')
      .length(2)
      .deep.eq([Config, ConfigStore]);
    expect(configModule)
      .have.property('providers')
      .an('array')
      .length(2)
      .deep.eq([
        {
          provide: Config,
          useValue: { store },
        },
        {
          provide: ConfigStore,
          useValue: store,
        },
      ]);
    expect(configModule.module).eq(ConfigModule);
  });
});

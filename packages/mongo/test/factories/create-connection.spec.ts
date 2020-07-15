import * as chai from 'chai';
import * as sinon from 'sinon';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinonChai from 'sinon-chai';
import * as proxyquire from 'proxyquire';
import { MongoRetryOptions } from '../../lib/interfaces';
import { MongoClient } from 'mongodb';
import { MongoConnectionError } from '../../lib/errors';

chai.use(chaiAsPromised);
chai.use(sinonChai);
const expect = chai.expect;

describe('Create connection factory', () => {
  afterEach(() => {
    sinon.restore();
  });
  it('should call connect on mongo client', async () => {
    const stubMongoClientConnect = sinon.stub().resolves();
    const { createConnection } = proxyquire('../../lib/factories/create-connection.factory', {
      mongodb: {
        MongoClient: {
          connect: stubMongoClientConnect,
        },
      },
    });
    const testString = 'mongodb://test';
    const testOptions = { foo: 'bar' };
    await createConnection(testString, testOptions);
    expect(stubMongoClientConnect).calledOnceWithExactly(testString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      ...testOptions,
    });
  });
  describe('handle retry', async () => {
    let stubDelay: sinon.SinonStub;
    let handleRetryConnect: (func: () => Promise<MongoClient>, options?: MongoRetryOptions, currentRetryNumber?: number) => Promise<MongoClient>;
    beforeEach(() => {
      stubDelay = sinon.stub();
      const defaultImport = proxyquire('../../lib/utils/handle-retry-connect', {
        util: {
          promisify: () => stubDelay,
        },
      });
      handleRetryConnect = defaultImport.handleRetryConnect;
    });
    it('should retry 30 times with interval in 1000ms by default', async () => {
      const stubCreateConnectionFactory = sinon.stub().rejects();
      await expect(handleRetryConnect(stubCreateConnectionFactory)).eventually.rejectedWith(MongoConnectionError);
      /*
      * call count should +1 because of reconnect tries means
      * how many tries to reconnect after first initial connection
      * */
      expect(stubCreateConnectionFactory).callCount(31);
      expect(stubDelay).calledWithExactly(1000);
    });
    it('retry strategy can be customized', async () => {
      const stubCreateConnectionFactory = sinon.stub().rejects();
      const reconnectTries = 5;
      const reconnectInterval = 3000;
      await expect(handleRetryConnect(stubCreateConnectionFactory, { reconnectTries, reconnectInterval })).eventually.rejectedWith(MongoConnectionError);
      expect(stubCreateConnectionFactory).callCount(reconnectTries + 1);
      expect(stubDelay).calledWithExactly(reconnectInterval);
    });
    it('should return mongo client if first connection is successfully', async () => {
      const mongoClient = {};
      const stubCreateConnectionFactory = sinon.stub().resolves(mongoClient);
      const result = await handleRetryConnect(stubCreateConnectionFactory);
      expect(result).eq(mongoClient);
      expect(stubCreateConnectionFactory).calledOnce;
    });
    it('should return mongo client if second connection is successfully', async () => {
      const mongoClient = {};
      const stubCreateConnectionFactory = sinon
        .stub()
        .onFirstCall().rejects()
        .onSecondCall().resolves(mongoClient);
      const result = await handleRetryConnect(stubCreateConnectionFactory);
      expect(result).eq(mongoClient);
      expect(stubCreateConnectionFactory).calledTwice;
    });
  });
});

import { expect } from 'chai';
import { Controller } from '../decorators';
import { ROUTER_INSTANCE } from '@uzert/core/constants';

describe('Decorators', () => {
  describe('@Controller decorator', () => {
    it('should miss if wrapped on the class', () => {
      @Controller()
      class TestController {}
      const metadata = Reflect.getMetadata(ROUTER_INSTANCE, TestController);
      expect(metadata).is.undefined;
    });
    it('should set router parent on the controller method', () => {
      class TestController {
        @Controller()
        public test() {
          return 'test';
        }
      }
      const testController = new TestController();
      const controllerInstance: TestController = Reflect.getMetadata(ROUTER_INSTANCE, testController.test);
      expect(controllerInstance.test()).eq('test');
    });
  });
});

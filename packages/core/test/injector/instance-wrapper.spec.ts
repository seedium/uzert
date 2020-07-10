import { expect } from 'chai';
import { InstanceWrapper } from '../../injector/instance-wrapper';

describe('InstanceWrapper', () => {
  it('should return id of instance wrapper', () => {
    const instanceWrapper = new InstanceWrapper();
    expect(instanceWrapper.id).an('string');
  });
  it('if values was not found should throw an error', () => {
    const instanceWrapper = new InstanceWrapper();
    expect(() => instanceWrapper.getInstanceByContextId({ id: 0 })).throw();
  });
  describe('when add properties metadata', () => {
    const instanceWrapperProperty = new InstanceWrapper();
    it('if empty should create new array of properties', () => {
      const instanceWrapper = new InstanceWrapper();
      instanceWrapper.addPropertiesMetadata('test', instanceWrapperProperty);
      expect(instanceWrapper.getPropertiesMetadata()).to.eql([{ key: 'test', wrapper: instanceWrapperProperty }]);
    });
    it('if exists should add new one', () => {
      const instanceWrapper = new InstanceWrapper();
      instanceWrapper.addPropertiesMetadata('test', instanceWrapperProperty);
      instanceWrapper.addPropertiesMetadata('test1', instanceWrapperProperty);
      expect(instanceWrapper.getPropertiesMetadata()).length(2);
    });
  });
});

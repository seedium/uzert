import { ModuleOptions } from '@uzert/core';
import { TestingModuleBuilder } from './testing-module-builder';

export class Test {
  public static createTestingModule(metadata: ModuleOptions): TestingModuleBuilder {
    return new TestingModuleBuilder(metadata);
  }
}

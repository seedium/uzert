import { expect } from 'chai';
import { ModuleCompiler } from '../../injector/module-compiler';
import { ModuleTokenFactory } from '../../injector/module-token-factory';

describe('ModuleCompiler', () => {
  it('module compiler can be created with default token factory', () => {
    const moduleCompiler = new ModuleCompiler();
    expect((moduleCompiler as any).moduleTokenFactory).instanceOf(ModuleTokenFactory);
  });
});

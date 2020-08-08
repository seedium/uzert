import { expect } from 'chai';
import { ModuleCompiler } from '../../injector/module-compiler';
import { ModuleTokenFactory } from '../../injector/module-token-factory';

describe('ModuleCompiler', () => {
  let moduleCompiler: ModuleCompiler;
  beforeEach(() => {
    moduleCompiler = new ModuleCompiler();
  });
  it('module compiler can be created with default token factory', () => {
    expect((moduleCompiler as any).moduleTokenFactory).instanceOf(
      ModuleTokenFactory,
    );
  });
  it('should extract metadata from simple type', async () => {
    class TestProvider {}
    const result = await moduleCompiler.extractMetadata(TestProvider);
    expect(result).deep.eq({
      type: TestProvider,
    });
  });
  it('should extract metadata from dynamic module', async () => {
    class TestModule {}
    const result = await moduleCompiler.extractMetadata({
      module: TestModule,
    });
    expect(result).deep.eq({
      type: TestModule,
    });
  });
});

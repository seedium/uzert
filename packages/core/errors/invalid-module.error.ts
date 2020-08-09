import { DynamicModule, Type } from '../interfaces';
import { isDynamicModule } from '../utils';

export class InvalidModuleError extends Error {
  constructor(parentModule: Type<unknown> | DynamicModule, index?: number) {
    let module: Type<unknown>;
    if (isDynamicModule(parentModule)) {
      module = parentModule.module;
    } else {
      module = parentModule;
    }
    const parentModuleName = module?.name || 'module';
    super(
      `Uzert cannot create the ${parentModuleName} instance.
Received an unexpected value at index [${index}] of the ${parentModuleName} "imports" array. `,
    );
  }
}

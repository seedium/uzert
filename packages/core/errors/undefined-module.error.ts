import { DynamicModule, Type } from '../interfaces';
import { isDynamicModule } from '../utils';

export class UndefinedModuleError extends Error {
  constructor(parentModule: Type<unknown> | DynamicModule, index: number) {
    let module: Type<unknown>;
    if (isDynamicModule(parentModule)) {
      module = parentModule.module;
    } else {
      module = parentModule;
    }
    const parentModuleName = module?.name || 'module';
    super(`Uzert cannot create the ${parentModuleName} instance.
The module at index [${index}] of the ${parentModuleName} "imports" array is undefined.

Potential causes:
- A circular dependency between modules. Unfortunately, it's not supported currently.
- The module at index [${index}] is of type "undefined". Check your import statements and the type of the module.`);
  }
}

import { Abstract, DynamicModule, Type } from '../interfaces';
import { isDynamicModule } from '../utils';

export class InvalidModuleError extends Error {
  constructor(
    parentModule: Type<unknown> | DynamicModule | Promise<DynamicModule>,
    index?: number,
  ) {
    let module: Type<unknown> | Abstract<unknown>;
    if (isDynamicModule(parentModule)) {
      module = (parentModule as DynamicModule).module;
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

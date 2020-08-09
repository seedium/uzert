import { isNil, isSymbol } from '@uzert/helpers';
import {
  InjectorDependencyContext,
  ProviderStaticToken,
  Type,
  InjectorDependency,
} from '../interfaces';
import { Module } from '../injector/module';

const getInstanceName = (instance: unknown): string | undefined =>
  instance && (instance as Type<unknown>).name;

const getModuleName = (module: Module): string =>
  (module && getInstanceName(module.metatype)) || 'current';

const getDependencyName = (dependency: InjectorDependency): string =>
  // use class name
  getInstanceName(dependency) ||
  // use injection token (symbol)
  (isSymbol(dependency) && dependency.toString()) ||
  // use string directly
  (dependency as string) ||
  // otherwise
  '+';

export class UnknownDependencyError extends Error {
  constructor(
    type: ProviderStaticToken,
    dependencyContext: InjectorDependencyContext,
    moduleRef?: Module,
  ) {
    const {
      index,
      name = 'dependency',
      dependencies,
      key = 'undefined',
    } = dependencyContext;
    const moduleName = getModuleName(moduleRef);
    const dependencyName = getDependencyName(name);
    const token = isSymbol(type) ? type.toString() : type;

    let message = `Uzert can't resolve dependencies of the ${token}`;

    const potentialSolutions = `\n
Potential solutions:
- If ${dependencyName} is a provider, is it part of the current ${moduleName}?
- If ${dependencyName} is exported from a separate @Module, is that module imported within ${moduleName}?
  @Module({
    imports: [ /* the Module containing ${dependencyName} */ ]
  })
`;
    if (isNil(index)) {
      message += `. Please make sure that the "${key.toString()}" property is available in the current context.${potentialSolutions}`;
      super(message);
      return;
    }
    const dependenciesName = (dependencies || []).map(getDependencyName);
    dependenciesName[index] = '?';

    message += ` (`;
    message += dependenciesName.join(', ');
    message += `). Please make sure that the argument ${dependencyName} at index [${index}] is available in the ${getModuleName(
      moduleRef,
    )} context.`;
    message += potentialSolutions;
    super(message);
  }
}

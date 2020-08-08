import { isNil, isFunction, isUndefined } from '@uzert/helpers';
import { UzertContainer } from './uzert-container';
import { Module } from './module';
import {
  Type,
  FactoryProvider,
  Provider,
  RouteModule,
  IInjectable,
  InjectablesSchema,
} from '../interfaces';
import { MODULE_KEYS, PIPES_METADATA } from '../constants';
import { MetadataScanner } from '../metadata-scanner';
import { DynamicModule } from '../interfaces/modules';
import {
  CircularDependencyError,
  InvalidModuleError,
  UndefinedModuleError,
} from '../errors';

export class DependenciesScanner {
  constructor(private readonly container: UzertContainer) {}
  public async scan(module: Type<unknown>): Promise<void> {
    await this.scanForModules(module);
    await this.scanModulesForDependencies();
  }
  public async scanForModules(
    module: Type<unknown> | DynamicModule,
    scope: Type<unknown>[] = [],
    ctxRegistry: (DynamicModule | Type<unknown>)[] = [],
  ): Promise<Module> {
    const moduleInstance = await this.insertModule(module, scope);
    ctxRegistry.push(module);

    const modules = this.isDynamicModule(module)
      ? [
          ...this.reflectMetadata(module.module, MODULE_KEYS.IMPORTS),
          ...(module.imports || []),
        ]
      : this.reflectMetadata(module, MODULE_KEYS.IMPORTS);

    for (const [index, innerModule] of modules.entries()) {
      // In case of a circular dependency (ES module system), JavaScript will resolve the type to `undefined`.
      if (innerModule === undefined) {
        throw new UndefinedModuleError(module, index);
      }
      if (!innerModule) {
        throw new InvalidModuleError(module, index);
      }
      if (ctxRegistry.includes(innerModule)) {
        continue;
      }
      await this.scanForModules(
        innerModule,
        [].concat(scope, module),
        ctxRegistry,
      );
    }
    return moduleInstance;
  }
  public async scanModulesForDependencies() {
    const modules = this.container.getModules();

    for (const [token, { metatype }] of modules) {
      await this.reflectImports(metatype, token, metatype.name);
      this.reflectProviders(metatype, token);
      this.reflectControllers(metatype, token);
      this.reflectRoutes(metatype, token);
      this.reflectExports(metatype, token);
    }
  }
  public async reflectImports(
    module: Type<unknown>,
    token: string,
    context: string,
  ) {
    const modules = this.reflectMetadata(module, MODULE_KEYS.IMPORTS);
    for (const related of modules) {
      await this.insertImport(related, token, context);
    }
  }
  public reflectProviders(module: Type<any>, token: string) {
    const providers = this.reflectMetadata(module, MODULE_KEYS.PROVIDERS);

    providers.forEach((provider) => {
      this.insertProvider(provider, token);
    });
  }
  public reflectControllers(module: Type<any>, token: string) {
    const controllers = this.reflectMetadata(module, MODULE_KEYS.CONTROLLERS);

    controllers.forEach((controller) => {
      this.insertController(controller, token);
      this.reflectDynamicMetadata(controller, token);
    });
  }
  public reflectRoutes(module: Type<RouteModule>, token: string) {
    const routes = this.reflectMetadata(module, MODULE_KEYS.ROUTES);
    routes.forEach((route) => {
      this.insertRoute(route, token);
    });
  }
  public reflectMetadata(metatype: Type<any>, metadataKey: string) {
    return Reflect.getMetadata(metadataKey, metatype) || [];
  }
  public reflectExports(module: Type<unknown>, token: string) {
    const exports = this.reflectMetadata(module, MODULE_KEYS.EXPORTS);
    exports.forEach((exportedProvider) =>
      this.insertExportedProvider(exportedProvider, token),
    );
  }
  public async insertImport(related: any, token: string, context: string) {
    if (isUndefined(related)) {
      throw new CircularDependencyError(context);
    }
    await this.container.addImport(related, token);
  }
  public async insertModule(
    module: any,
    scope: Type<unknown>[],
  ): Promise<Module> {
    return this.container.addModule(module, scope);
  }
  public insertProvider(provider: Provider, token: string) {
    return this.container.addProvider(provider as Type<any>, token);
  }
  public insertController(controller: Type<any>, token: string) {
    return this.container.addController(controller, token);
  }
  public insertRoute(route: Type<RouteModule>, token: string) {
    return this.container.addRoute(route, token);
  }
  public insertInjectable(
    injectable: Type<IInjectable>,
    token: string,
    host: Type<IInjectable>,
    hostMethodName?: string,
  ) {
    this.container.addInjectable(injectable, token, host, hostMethodName);
  }
  public insertExportedProvider(
    exportedProvider: Type<IInjectable>,
    token: string,
  ) {
    this.container.addExportedProvider(exportedProvider, token);
  }
  public isCustomProvider(provider: Provider): provider is FactoryProvider {
    return provider && !isNil((provider as any).provide);
  }
  public isDynamicModule(
    module: Type<any> | DynamicModule,
  ): module is DynamicModule {
    return module && !!(module as DynamicModule).module;
  }
  public reflectDynamicMetadata(obj: Type<IInjectable>, token: string) {
    if (!obj || !obj.prototype) {
      return;
    }
    this.reflectInjectables(obj, token, PIPES_METADATA);
  }
  public reflectInjectables(
    component: Type<IInjectable>,
    token: string,
    metadataKey: string,
  ) {
    const controllerInjectables: InjectablesSchema[] = [
      {
        injectables: this.reflectMetadata(component, metadataKey),
      },
    ];
    const methodsInjectables: InjectablesSchema[] = MetadataScanner.scanFromPrototype(
      component.prototype,
      (methodName) => ({
        hostMethodName: methodName,
        injectables:
          this.reflectKeyMetadata(component, metadataKey, methodName) || [],
      }),
    );

    const combinedInjectables: InjectablesSchema[] = [
      ...controllerInjectables,
      ...methodsInjectables,
    ].map(this.filterInvalidInjectablesSchemas.bind(this));
    const injectablesSchemas = Array.from(new Set(combinedInjectables));

    injectablesSchemas.forEach((injectableSchema) =>
      injectableSchema.injectables.forEach((injectable) =>
        this.insertInjectable(
          injectable,
          token,
          component,
          injectableSchema.hostMethodName,
        ),
      ),
    );
  }
  public reflectKeyMetadata(
    component: Type<IInjectable>,
    key: string,
    method: string,
  ) {
    let prototype = component.prototype;
    do {
      const descriptor = Reflect.getOwnPropertyDescriptor(prototype, method);
      if (!descriptor) {
        continue;
      }
      return Reflect.getMetadata(key, descriptor.value);
    } while (
      (prototype = Reflect.getPrototypeOf(prototype)) &&
      prototype &&
      prototype !== Object.prototype
    );
    return undefined;
  }
  private filterInvalidInjectablesSchemas(
    injectableSchema: InjectablesSchema,
  ): InjectablesSchema {
    injectableSchema.injectables = injectableSchema.injectables.filter(
      (injectable) =>
        isFunction(injectable) || this.isCustomProvider(injectable),
    );
    return injectableSchema;
  }
}

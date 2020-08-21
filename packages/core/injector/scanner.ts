import { isNil, isFunction, isUndefined } from '@uzert/helpers';
import { UzertContainer } from './uzert-container';
import { Module } from './module';
import {
  Type,
  Provider,
  RouteModule,
  IInjectable,
  InjectablesSchema,
  CustomProvider,
  Abstract,
} from '../interfaces';
import { MODULE_KEYS, PIPES_METADATA } from '../constants';
import { MetadataScanner } from '../metadata-scanner';
import { DynamicModule } from '../interfaces/modules';
import {
  CircularDependencyError,
  InvalidModuleError,
  UndefinedModuleError,
} from '../errors';
import { isDynamicModule } from '../utils';

export class DependenciesScanner {
  constructor(private readonly container: UzertContainer) {}
  public async scan(module: Type<unknown>): Promise<void> {
    await this.scanForModules(module);
    await this.scanModulesForDependencies();
  }
  public async scanForModules(
    module: Type<unknown> | DynamicModule | Promise<DynamicModule>,
    scope: Type<unknown>[] = [],
    ctxRegistry: (
      | DynamicModule
      | Promise<DynamicModule>
      | Type<unknown>
    )[] = [],
  ): Promise<Module> {
    const moduleInstance = await this.insertModule(module, scope);
    ctxRegistry.push(module);

    let modules: (Type<unknown> | DynamicModule | Promise<DynamicModule>)[];
    if (isDynamicModule(module)) {
      if (module instanceof Promise) {
        module = await module;
      }
      modules = [
        ...this.reflectMetadata<
          Type<unknown | DynamicModule | Promise<DynamicModule>>[]
        >(module.module, MODULE_KEYS.IMPORTS),
        ...(module.imports || []),
      ];
    } else {
      modules = this.reflectMetadata<Type<unknown>[]>(
        module,
        MODULE_KEYS.IMPORTS,
      );
    }

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
  public async scanModulesForDependencies(): Promise<void> {
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
    module: Type<unknown> | Abstract<unknown>,
    token: string,
    context: string,
  ): Promise<void> {
    const modules = [
      ...this.reflectMetadata<Array<Type<unknown> | DynamicModule>>(
        module,
        MODULE_KEYS.IMPORTS,
      ),
      ...this.container.getDynamicMetadataByToken(
        token,
        MODULE_KEYS.IMPORTS as 'imports',
      ),
    ];
    for (const related of modules) {
      await this.insertImport(
        related as Type<unknown> | DynamicModule,
        token,
        context,
      );
    }
  }
  public reflectProviders(
    module: Type<unknown> | Abstract<unknown>,
    token: string,
  ): void {
    const providers = [
      ...this.reflectMetadata<Type<unknown>[]>(module, MODULE_KEYS.PROVIDERS),
      ...this.container.getDynamicMetadataByToken(
        token,
        MODULE_KEYS.PROVIDERS as 'providers',
      ),
    ];
    providers.forEach((provider) => {
      this.insertProvider(provider as Provider, token);
    });
  }
  public reflectControllers(
    module: Type<unknown> | Abstract<unknown>,
    token: string,
  ): void {
    const controllers = [
      ...this.reflectMetadata<Type<unknown>[]>(module, MODULE_KEYS.CONTROLLERS),
      ...this.container.getDynamicMetadataByToken(
        token,
        MODULE_KEYS.CONTROLLERS as 'controllers',
      ),
    ];

    controllers.forEach((controller) => {
      this.insertController(controller as Type<unknown>, token);
      this.reflectDynamicMetadata(controller as Type<unknown>, token);
    });
  }
  public reflectRoutes(
    module: Type<unknown> | Abstract<unknown>,
    token: string,
  ): void {
    const routes = [
      ...this.reflectMetadata(module, MODULE_KEYS.ROUTES),
      ...this.container.getDynamicMetadataByToken(
        token,
        MODULE_KEYS.ROUTES as 'routes',
      ),
    ];
    routes.forEach((route) => {
      this.insertRoute(route as Type<RouteModule>, token);
    });
  }
  public reflectExports(
    module: Type<unknown> | Abstract<unknown>,
    token: string,
  ): void {
    const exports = [
      ...this.reflectMetadata<Type<unknown>[]>(module, MODULE_KEYS.EXPORTS),
      ...this.container.getDynamicMetadataByToken(
        token,
        MODULE_KEYS.EXPORTS as 'exports',
      ),
    ];
    exports.forEach((exportedProvider) =>
      this.insertExportedProvider(exportedProvider as Type<unknown>, token),
    );
  }
  public reflectMetadata<T = unknown[]>(
    metatype: Type<unknown> | Abstract<unknown>,
    metadataKey: string,
  ): T {
    return Reflect.getMetadata(metadataKey, metatype) || [];
  }
  public async insertImport(
    related: Type<unknown> | DynamicModule,
    token: string,
    context: string,
  ): Promise<void> {
    if (isUndefined(related)) {
      throw new CircularDependencyError(context);
    }
    await this.container.addImport(related, token);
  }
  public async insertModule(
    module: Type<unknown> | DynamicModule | Promise<DynamicModule>,
    scope: Type<unknown>[],
  ): Promise<Module> {
    return this.container.addModule(module, scope);
  }
  public insertProvider(provider: Provider, token: string): string {
    return this.container.addProvider(provider as Type<unknown>, token);
  }
  public insertController(controller: Type<unknown>, token: string): string {
    return this.container.addController(controller, token);
  }
  public insertRoute(route: Type<RouteModule>, token: string): string {
    return this.container.addRoute(route, token);
  }
  public insertInjectable(
    injectable: Type<IInjectable>,
    token: string,
    host: Type<IInjectable>,
    hostMethodName?: string,
  ): void {
    this.container.addInjectable(injectable, token, host, hostMethodName);
  }
  public insertExportedProvider(
    exportedProvider: Type<IInjectable>,
    token: string,
  ): void {
    this.container.addExportedProvider(exportedProvider, token);
  }
  public isCustomProvider(provider: Provider): provider is CustomProvider {
    return provider && !isNil((provider as CustomProvider).provide);
  }
  public reflectDynamicMetadata(obj: Type<IInjectable>, token: string): void {
    if (!obj || !obj.prototype) {
      return;
    }
    this.reflectInjectables(obj, token, PIPES_METADATA);
  }
  public reflectInjectables(
    component: Type<IInjectable>,
    token: string,
    metadataKey: string,
  ): void {
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
  public reflectKeyMetadata<T = unknown>(
    component: Type<IInjectable>,
    key: string,
    method: string,
  ): T {
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

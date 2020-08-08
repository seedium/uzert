import iterate from 'iterare';
import {
  isNil,
  isFunction,
  isString,
  capitalize,
  isSymbol,
  isUndefined,
} from '@uzert/helpers';
import {
  Type,
  IInjectable,
  Controller,
  Provider,
  FactoryProvider,
  ProviderName,
  Abstract,
  RouteModule,
  DynamicModule,
  ClassProvider,
  ValueProvider,
} from '../interfaces';
import { InstanceWrapper } from './instance-wrapper';
import { getRandomString } from '../utils/get-random-string';
import { CONTROLLER_ID_KEY } from './injector.constants';
import { UnknownExportError } from '../errors';

export class Module {
  private readonly _id: string;
  private readonly _imports = new Set<Module>();
  private readonly _providers = new Map<any, InstanceWrapper<IInjectable>>();
  private readonly _controllers = new Map<any, InstanceWrapper<IInjectable>>();
  private readonly _routes = new Map<any, InstanceWrapper<RouteModule>>();
  private readonly _injectables = new Map<any, InstanceWrapper<IInjectable>>();
  private readonly _exports = new Set<string | symbol>();

  constructor(
    private readonly _metatype: Type<any>,
    private readonly _scope: Type<any>[],
  ) {
    this._id = getRandomString();
  }
  get id(): string {
    return this._id;
  }
  get metatype(): Type<any> {
    return this._metatype;
  }
  get imports(): Set<Module> {
    return this._imports;
  }
  get providers(): Map<any, InstanceWrapper<IInjectable>> {
    return this._providers;
  }
  get controllers(): Map<any, InstanceWrapper<IInjectable>> {
    return this._controllers;
  }
  get routes(): Map<any, InstanceWrapper<RouteModule>> {
    return this._routes;
  }
  get injectables(): Map<string, InstanceWrapper<IInjectable>> {
    return this._injectables;
  }
  get exports(): Set<string | symbol> {
    return this._exports;
  }
  public addProvider(provider: Provider): string {
    if (this.isCustomProvider(provider)) {
      return this.addCustomProvider(provider, this._providers);
    }

    this._providers.set(
      (provider as Type<IInjectable>).name,
      new InstanceWrapper({
        name: (provider as Type<IInjectable>).name,
        metatype: provider as Type<IInjectable>,
        instance: null,
        isResolved: false,
        host: this,
      }),
    );

    return (provider as Type<IInjectable>).name;
  }
  public getProviderInstanceWrapper<T>(provider: Provider): InstanceWrapper {
    if (this.isCustomProvider(provider)) {
      const staticToken = this.getProviderStaticToken(provider.provide);
      return this._providers.get(staticToken);
    }
    return this._providers.get((provider as Type<IInjectable>).name);
  }
  public addController(controller: Type<IInjectable>): string {
    this._controllers.set(
      controller.name,
      new InstanceWrapper({
        name: controller.name,
        metatype: controller,
        instance: null,
        isResolved: false,
        host: this,
      }),
    );

    this.assignControllerUniqueId(controller as Type<Controller>);

    return controller.name;
  }
  public addRelatedModule(module: Module) {
    this._imports.add(module);
  }
  public addRoute(route: Type<RouteModule>): string {
    this._routes.set(
      route.name,
      new InstanceWrapper<RouteModule>({
        name: route.name,
        metatype: route,
        instance: null,
        isResolved: false,
        host: this,
      }),
    );

    return route.name;
  }
  public addInjectable<T extends IInjectable>(
    injectable: Provider,
    host?: Type<T>,
    hostMethodName?: string,
  ) {
    let instanceWrapper: InstanceWrapper;
    if (this.isCustomProvider(injectable)) {
      const name = this.addCustomProvider(
        injectable,
        this._injectables,
        hostMethodName,
      );
      instanceWrapper = this.injectables.get(name);
    } else {
      instanceWrapper = this.injectables.get(injectable.name);
      if (!instanceWrapper) {
        instanceWrapper = new InstanceWrapper({
          name: injectable.name,
          metatype: injectable,
          instance: null,
          isResolved: false,
          host: this,
        });
        this._injectables.set(injectable.name, instanceWrapper);
      }
    }
    if (host) {
      const token = host && host.name;
      const hostWrapper =
        this._controllers.get(token) || this._providers.get(token);
      hostWrapper && hostWrapper.addEnhancerMetadata(instanceWrapper);
    }
  }
  public addExportedProvider(
    provider: (Provider & ProviderName) | string | symbol | DynamicModule,
  ) {
    const addExportedUnit = (token: string | symbol) =>
      this._exports.add(this.validateExportedProvider(token));

    if (this.isCustomProvider(provider as any)) {
      return this.addCustomExportedProvider(provider as any);
    } else if (isString(provider) || isSymbol(provider)) {
      return addExportedUnit(provider);
    } else if (this.isDynamicModule(provider)) {
      const { module } = provider;
      return addExportedUnit(module.name);
    }
    addExportedUnit(provider.name);
  }
  public addCustomExportedProvider(
    provider: FactoryProvider | ClassProvider | ValueProvider,
  ) {
    const provide = provider.provide;
    if (isString(provide) || isSymbol(provide)) {
      return this._exports.add(this.validateExportedProvider(provide));
    }
    this._exports.add(this.validateExportedProvider(provide.name));
  }
  public validateExportedProvider(token: string | symbol) {
    if (this._providers.has(token)) {
      return token;
    }
    const importsArray = [...this._imports.values()];
    const importsNames = iterate(importsArray)
      .filter((item) => !!item)
      .map(({ metatype }) => metatype)
      .filter((metatype) => !!metatype)
      .map(({ name }) => name)
      .toArray();

    if (!importsNames.includes(token as string)) {
      const { name } = this.metatype;
      throw new UnknownExportError(token, name);
    }
    return token;
  }
  public assignControllerUniqueId(controller: Type<Controller>) {
    Object.defineProperty(controller, CONTROLLER_ID_KEY, {
      enumerable: false,
      writable: false,
      configurable: true,
      value: getRandomString(),
    });
  }
  public isCustomProvider(
    provider: Provider,
  ): provider is FactoryProvider | ClassProvider | ValueProvider {
    return !isNil((provider as FactoryProvider).provide);
  }
  public addCustomProvider(
    provider: (FactoryProvider | ClassProvider | ValueProvider) & ProviderName,
    collection: Map<string, any>,
    hostMethodName?: string,
  ): string {
    const name = this.getProviderStaticToken(
      provider.provide,
      hostMethodName,
    ) as string;
    provider = {
      ...provider,
      name,
    };

    if (this.isCustomClass(provider)) {
      this.addCustomClass(provider, collection);
    } else if (this.isCustomValue(provider)) {
      this.addCustomValue(provider, collection);
    } else if (this.isCustomFactory(provider)) {
      this.addCustomFactory(provider, collection);
    }

    return name;
  }
  public isCustomClass(provider: any): provider is ClassProvider {
    return !isUndefined((provider as ClassProvider).useClass);
  }
  public isCustomValue(provider: any): provider is ValueProvider {
    return !isUndefined((provider as ValueProvider).useValue);
  }
  public isCustomFactory(provider: any): provider is FactoryProvider {
    return !isUndefined((provider as FactoryProvider).useFactory);
  }
  public isDynamicModule(exported: any): exported is DynamicModule {
    return exported && exported.module;
  }
  public getProviderStaticToken(
    provider: string | symbol | Type<any> | Abstract<any>,
    suffix?: string,
  ): string | symbol {
    const name = isFunction(provider)
      ? (provider as Function).name
      : (provider as string | symbol);
    if (isString(name) && suffix) {
      return name + capitalize(suffix);
    } else {
      return name;
    }
  }
  public addCustomFactory(
    provider: FactoryProvider & ProviderName,
    collection: Map<string, InstanceWrapper>,
  ) {
    const { name, useFactory: factory, inject } = provider;

    collection.set(
      name as string,
      new InstanceWrapper({
        name,
        metatype: factory as any,
        instance: null,
        isResolved: false,
        inject: inject || [],
        host: this,
      }),
    );
  }
  public addCustomClass(
    provider: ClassProvider & ProviderName,
    collection: Map<string, InstanceWrapper>,
  ) {
    const { name, useClass } = provider;

    collection.set(
      name as string,
      new InstanceWrapper({
        name,
        metatype: useClass,
        instance: null,
        isResolved: false,
        host: this,
      }),
    );
  }
  public addCustomValue(
    provider: ValueProvider & ProviderName,
    collection: Map<string, InstanceWrapper>,
  ) {
    const { name, useValue: value } = provider;
    collection.set(
      name as string,
      new InstanceWrapper({
        name,
        metatype: null,
        instance: value,
        isResolved: true,
        async: value instanceof Promise,
        host: this,
      }),
    );
  }
}

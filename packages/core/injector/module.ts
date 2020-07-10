import { isNil, isFunction, isString, capitalize } from '@uzert/helpers';
import {
  Type,
  IInjectable,
  Controller,
  Provider,
  FactoryProvider,
  ProviderName,
  Abstract,
  RouteModule,
} from '../interfaces';
import { InstanceWrapper } from './instance-wrapper';
import { getRandomString } from '../utils/get-random-string';
import { CONTROLLER_ID_KEY } from './injector.constants';

export class Module {
  private readonly _id: string;
  private readonly _providers = new Map<any, InstanceWrapper<IInjectable>>();
  private readonly _controllers = new Map<any, InstanceWrapper<IInjectable>>();
  private readonly _routes = new Map<any, InstanceWrapper<RouteModule>>();
  private readonly _injectables = new Map<any, InstanceWrapper<IInjectable>>();

  constructor(private readonly _metatype: Type<any>, private readonly _scope: Type<any>[]) {
    this._id = getRandomString();
  }
  get metatype(): Type<any> {
    return this._metatype;
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
  public addRoute(route: Type<IInjectable>): string {
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
  public addInjectable<T extends IInjectable>(injectable: Provider, host?: Type<T>, hostMethodName?: string) {
    let instanceWrapper: InstanceWrapper;
    if (this.isCustomProvider(injectable)) {
      const name = this.addCustomProvider(injectable, this._injectables, hostMethodName);
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
      const hostWrapper = this._controllers.get(token) || this._providers.get(token);
      hostWrapper && hostWrapper.addEnhancerMetadata(instanceWrapper);
    }
  }
  public assignControllerUniqueId(controller: Type<Controller>) {
    Object.defineProperty(controller, CONTROLLER_ID_KEY, {
      enumerable: false,
      writable: false,
      configurable: true,
      value: getRandomString(),
    });
  }

  public isCustomProvider(provider: Provider): provider is FactoryProvider {
    return !isNil((provider as FactoryProvider).provide);
  }

  public addCustomProvider(
    provider: FactoryProvider & ProviderName,
    collection: Map<string, any>,
    hostMethodName?: string,
  ): string {
    const name = this.getProviderStaticToken(provider.provide, hostMethodName) as string;

    provider = {
      ...provider,
      name,
    };

    this.addCustomFactory(provider, collection);

    return name;
  }

  public getProviderStaticToken(
    provider: string | symbol | Type<any> | Abstract<any>,
    suffix?: string,
  ): string | symbol {
    const name = isFunction(provider) ? (provider as Function).name : (provider as string | symbol);
    if (isString(name) && suffix) {
      return name + capitalize(suffix);
    } else {
      return name;
    }
  }

  public addCustomFactory(provider: FactoryProvider & ProviderName, collection: Map<string, InstanceWrapper>) {
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
}

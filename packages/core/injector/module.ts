import { isNil, isFunction, isUndefined } from '@uzert/helpers';
import { Type, IInjectable, Controller, Provider, FactoryProvider, ProviderName, Abstract } from '../interfaces';
import { InstanceWrapper } from './instance-wrapper';
import { getRandomString } from '../utils/get-random-string';
import { CONTROLLER_ID_KEY } from './injector.constants';

export class Module {
  private readonly _id: string;
  private readonly _providers = new Map<any, InstanceWrapper<IInjectable>>();
  private readonly _controllers = new Map<any, InstanceWrapper<IInjectable>>();

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

  public addCustomProvider(provider: FactoryProvider & ProviderName, collection: Map<string, any>): string {
    const name = this.getProviderStaticToken(provider.provide) as string;

    provider = {
      ...provider,
      name,
    };

    if (this.isCustomFactory(provider)) {
      this.addCustomFactory(provider, collection);
    }

    return name;
  }

  public getProviderStaticToken(provider: string | symbol | Type<any> | Abstract<any>): string | symbol {
    return isFunction(provider) ? (provider as Function).name : (provider as string | symbol);
  }

  public isCustomFactory(provider: any): provider is FactoryProvider {
    return !isUndefined((provider as FactoryProvider).useFactory);
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

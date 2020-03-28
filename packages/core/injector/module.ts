import { Type, IInjectable, Controller } from '../interfaces';
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

  public addProvider(provider: Type<IInjectable>): string {
    this._providers.set(
      provider.name,
      new InstanceWrapper({
        name: provider.name,
        metatype: provider,
        instance: null,
        isResolved: false,
        host: this,
      }),
    );

    return provider.name;
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
}

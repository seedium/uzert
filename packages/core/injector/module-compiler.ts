import { DynamicModule, Type } from '../interfaces';
import { ModuleTokenFactory } from './module-token-factory';

export interface ModuleFactory {
  type: Type<unknown>;
  token: string;
}

export class ModuleCompiler {
  constructor(private readonly moduleTokenFactory = new ModuleTokenFactory()) {}

  public async compile(
    metatype: Type<unknown> | DynamicModule,
  ): Promise<ModuleFactory> {
    const { type } = await this.extractMetadata(metatype);
    const token = this.moduleTokenFactory.create(type);
    return { type, token };
  }
  public async extractMetadata(
    metatype: Type<unknown> | DynamicModule,
  ): Promise<{
    type: Type<unknown>;
  }> {
    metatype = await metatype;
    if (!this.isDynamicModule(metatype)) {
      return { type: metatype };
    }
    const { module: type } = metatype;
    return { type };
  }
  public isDynamicModule(
    module: Type<unknown> | DynamicModule,
  ): module is DynamicModule {
    return !!(module as DynamicModule).module;
  }
}

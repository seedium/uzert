import { DynamicModule, Type } from '../interfaces';
import { ModuleTokenFactory } from './module-token-factory';

export interface ModuleFactory {
  type: Type<any>;
  token: string;
}

export class ModuleCompiler {
  constructor(private readonly moduleTokenFactory = new ModuleTokenFactory()) {}

  public async compile(metatype: Type<any> | DynamicModule): Promise<ModuleFactory> {
    const { type } = await this.extractMetadata(metatype);
    const token = this.moduleTokenFactory.create(type);
    return { type, token };
  }
  public async extractMetadata(
    metatype: Type<any> | DynamicModule,
  ): Promise<{
    type: Type<any>;
  }> {
    metatype = await metatype;
    if (!this.isDynamicModule(metatype)) {
      return { type: metatype };
    }
    const { module: type } = metatype;
    return { type };
  }
  public isDynamicModule(module: Type<any> | DynamicModule): module is DynamicModule {
    return !!(module as DynamicModule).module;
  }
}

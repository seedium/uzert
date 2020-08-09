import { DynamicModule, Type } from '../interfaces';
import { ModuleTokenFactory } from './module-token-factory';
import { isDynamicModule } from '../utils';

export interface ModuleFactory {
  type: Type<unknown>;
  token: string;
  dynamicMetadata?: Partial<DynamicModule>;
}

export class ModuleCompiler {
  constructor(private readonly moduleTokenFactory = new ModuleTokenFactory()) {}

  public async compile(
    metatype: Type<unknown> | DynamicModule | Promise<DynamicModule>,
  ): Promise<ModuleFactory> {
    const { type, dynamicMetadata } = await this.extractMetadata(metatype);
    const token = this.moduleTokenFactory.create(type);
    return { type, token, dynamicMetadata };
  }
  public async extractMetadata(
    metatype: Type<unknown> | DynamicModule | Promise<DynamicModule>,
  ): Promise<{
    type: Type<unknown>;
    dynamicMetadata?: Partial<DynamicModule> | undefined;
  }> {
    metatype = await metatype;
    if (!isDynamicModule(metatype)) {
      return { type: metatype };
    }
    const { module: type, ...dynamicMetadata } = metatype;
    return { type, dynamicMetadata };
  }
}

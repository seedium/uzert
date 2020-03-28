import { Type } from '../interfaces';
import { ModuleTokenFactory } from './module-token-factory';

export interface ModuleFactory {
  type: Type<any>;
  token: string;
}

export class ModuleCompiler {
  constructor(private readonly moduleTokenFactory = new ModuleTokenFactory()) {}

  public async compile(metatype: Type<any>): Promise<ModuleFactory> {
    const { type } = await this.extractMetadata(metatype);
    const token = this.moduleTokenFactory.create(type);
    return { type, token };
  }

  public async extractMetadata(
    metatype: Type<any>,
  ): Promise<{
    type: Type<any>;
  }> {
    metatype = await metatype;

    return { type: metatype };
  }
}

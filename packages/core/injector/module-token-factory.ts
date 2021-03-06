import * as hash from 'object-hash';
import { getRandomString } from '../utils/get-random-string';
import { Abstract, Type } from '../interfaces';

export class ModuleTokenFactory {
  private readonly moduleIdsCache = new WeakMap<
    Type<unknown> | Abstract<unknown>,
    string
  >();

  public create(metatype: Type<unknown> | Abstract<unknown>): string {
    const moduleId = this.getModuleId(metatype);

    const opaqueToken = {
      id: moduleId,
      module: this.getModuleName(metatype),
    };

    return hash(opaqueToken, { ignoreUnknown: true });
  }

  public getModuleId(metatype: Type<unknown> | Abstract<unknown>): string {
    let moduleId = this.moduleIdsCache.get(metatype);

    if (moduleId) {
      return moduleId;
    }

    moduleId = getRandomString();
    this.moduleIdsCache.set(metatype, moduleId);
    return moduleId;
  }

  public getModuleName(metatype: Type<unknown> | Abstract<unknown>): string {
    return metatype.name;
  }
}

import { IInjectable } from './injectable.interface';
import { Type } from './provider.interface';

export interface InjectablesSchema {
  hostMethodName?: string;
  injectables: Type<IInjectable>[];
}

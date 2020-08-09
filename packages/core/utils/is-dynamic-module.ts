import { DynamicModule } from '../interfaces/modules';

export const isDynamicModule = (module: unknown): module is DynamicModule => {
  return !!(module && (module as DynamicModule).module);
};

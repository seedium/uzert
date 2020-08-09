import { DynamicModule } from '../interfaces/modules';

export const isDynamicModule = (
  module: unknown,
): module is DynamicModule | Promise<DynamicModule> => {
  return !!(
    module &&
    ((module as DynamicModule).module || module instanceof Promise)
  );
};

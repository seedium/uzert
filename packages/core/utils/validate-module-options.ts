import { MODULE_KEYS } from '../constants';
import { ModuleValidationError } from '../errors';

const moduleKeys = [MODULE_KEYS.PROVIDERS, MODULE_KEYS.CONTROLLERS];

export const validateModuleKeys = (keys: string[]) => {
  const validateKey = (key: string) => {
    if (moduleKeys.includes(key)) {
      return;
    }
    throw new ModuleValidationError(key);
  };

  keys.forEach(validateKey);
};

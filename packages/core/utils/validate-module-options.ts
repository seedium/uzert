import { MODULE_KEYS } from '../constants';
import { ModuleValidationError } from '../errors';

const moduleKeys = [
  MODULE_KEYS.PROVIDERS,
  MODULE_KEYS.CONTROLLERS,
  MODULE_KEYS.ROUTES,
  MODULE_KEYS.IMPORTS,
  MODULE_KEYS.EXPORTS,
];

export const validateModuleKeys = (keys: string[]): void => {
  const validateKey = (key: string) => {
    if (moduleKeys.includes(key)) {
      return;
    }
    throw new ModuleValidationError(key);
  };

  keys.forEach(validateKey);
};

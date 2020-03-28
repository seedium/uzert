export class ModuleValidationError extends Error {
  public name = 'ModuleValidationError';

  constructor(moduleKey) {
    super(`Invalid passed key ${moduleKey} to @Module decorator.`);
  }
}

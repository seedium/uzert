export class ModuleValidationError extends Error {
  public name = 'ModuleValidationError';

  constructor(moduleKey: string) {
    super(`Invalid passed key ${moduleKey} to @Module decorator.`);
  }
}

export class InvalidModuleError extends Error {
  constructor(trace: any[]) {
    const scope = (trace || []).map((module) => module.name).join(' -> ');

    super(`Uzert cannot create the module instance. Often, this is because of a circular dependency between modules. Please, for now avoid it.

Scope [${scope}]`);
  }
}

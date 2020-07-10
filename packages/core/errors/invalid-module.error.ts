export class InvalidModuleError extends Error {
  constructor() {
    super(
      `Uzert cannot create the module instance. Often, this is because of a circular dependency between modules. Please, for now avoid it.`,
    );
  }
}

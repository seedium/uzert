export class UnknownModuleError extends Error {
  constructor(token = 'unknown') {
    super(`Uzert could not select the given module "${token}"`);
  }
}

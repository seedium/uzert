export class UnknownModuleError extends Error {
  constructor(token: string = 'unknown') {
    super(`Uzert could not select the given module "${token}"`);
  }
}

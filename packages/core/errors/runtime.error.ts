export class RuntimeError extends Error {
  constructor() {
    super(`RuntimeError. Please consider your issue`);

    this.name = 'RuntimeError';
  }
}

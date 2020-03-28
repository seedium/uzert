export class CircularDependencyError extends Error {
  constructor() {
    super(`A circular dependency has been detected. Please, avoid a bidirectional relationships`);
  }
}

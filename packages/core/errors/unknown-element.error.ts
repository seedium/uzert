export class UnknownElementError extends Error {
  constructor(name?: string) {
    super(
      `Uzert could not find ${
        name || 'given'
      } element (this provider does not exist or might be not included in providers scope)`,
    );
  }
}

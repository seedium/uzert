export default class SchemaGeneratorMerge extends Error {
  constructor() {
    super('Support only $ref source');

    this.name = 'SchemaGeneratorMerge';

    // Capturing stack trace, excluding constructor call from it.
    Error.captureStackTrace(this, this.constructor);
  }
}

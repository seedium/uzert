export default class MissedParamsError extends Error {
  constructor(params: string[]) {
    super(`Some params were missed. Please check "${params.join(', ')}" params in you "database" config.
		Also check that you have created config "database"`);

    // output to console info about error
    console.error(this.stack);

    // Capturing stack trace, excluding constructor call from it.
    Error.captureStackTrace(this, this.constructor);
  }
}

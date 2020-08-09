const MISSING_REQUIRED_DEPENDENCY = (name: string, reason: string) =>
  `The "${name}" package is missing. Please, make sure to install this library ($ npm install ${name}) to take advantage of ${reason}.`;

export function loadPackage<T = unknown>(
  packageName: string,
  context: string,
  loaderFn?: Function,
): T {
  try {
    return loaderFn ? loaderFn() : require(packageName);
  } catch (e) {
    console.error(MISSING_REQUIRED_DEPENDENCY(packageName, context));
    process.exit(1);
  }
}

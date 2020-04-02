import * as chalk from 'chalk';

interface TraceMethodTimeOptions {
  logger?: (message?: any, ...optionalParams: any[]) => void;
  startMessage?: string;
  finishMessage?: string;
}

export function TraceMethodTime({
  logger = console.log,
  startMessage = `Start "%s" method`,
  finishMessage = `Finish method in time: %s`,
}: TraceMethodTimeOptions = {}) {
  console.log();
  return (target: object, propertyName: string, descriptor: TypedPropertyDescriptor<any>) => {
    if (!descriptor.value) {
      throw new Error(`Decorator "@TraceMethodTime" can trace time only on method`);
    }
    const originalMethod = descriptor.value;
    descriptor.value = function (this: any, ...args: any[]) {
      const startTime = new Date().getTime();
      logger(chalk.blue(startMessage), propertyName);
      const result = originalMethod.apply(this, args);
      const finishTime = new Date().getTime();
      logger(chalk.green(finishMessage), finishTime - startTime);
      return result;
    };
    return descriptor;
  };
}

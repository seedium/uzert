import * as chalk from 'chalk';

interface TraceMethodTimeOptions {
  logger?: (message?: any, ...optionalParams: any[]) => void;
  printStartMessage?: (propertyName: string) => string;
  printFinishMessage?: (propertyName: string, time: number) => string;
}

export function TraceMethodTime({
  logger = console.log,
  printStartMessage = (propertyName: string) => `Start "${propertyName}" method`,
  printFinishMessage = (propertyName: string, time: number) => `Finish "${propertyName}" in time: ${time}ms`,
}: TraceMethodTimeOptions = {}) {
  return (target: object, propertyName: string, descriptor: TypedPropertyDescriptor<any>) => {
    if (!descriptor?.value) {
      throw new Error(`Decorator "@TraceMethodTime" can trace time only on method`);
    }
    let originalMethod = descriptor.value;
    descriptor.value = async function (this: any, ...args: any[]) {
      originalMethod = originalMethod.bind(this);
      const startTime = new Date().getTime();
      logger(chalk.blue(printStartMessage(propertyName)));
      const result = await originalMethod(...args);
      const finishTime = new Date().getTime();
      logger(chalk.green(printFinishMessage(propertyName, finishTime - startTime)));
      return result;
    };
    return descriptor;
  };
}

import * as chalk from 'chalk';

interface MessageOptions {
  propertyName: string;
  time: number;
}

interface TraceMethodTimeOptions {
  logger?: (message?: any, ...optionalParams: any[]) => void;
  printStartMessage?: (options: MessageOptions) => string;
  printFinishMessage?: (options: MessageOptions) => string;
}

export function TraceMethodTime({
  logger = console.log,
  printStartMessage = ({ propertyName }: MessageOptions) => `Start "${propertyName}" method`,
  printFinishMessage = ({ propertyName, time }: MessageOptions) => `Finish "${propertyName}" in time: ${time}ms`,
}: TraceMethodTimeOptions = {}) {
  return function (target: object, propertyName: string, descriptor: TypedPropertyDescriptor<any>, ...args) {
    if (!descriptor?.value) {
      throw new Error(`Decorator "@TraceMethodTime" can trace time only on method`);
    }
    let originalMethod = descriptor.value;
    descriptor.value = async function (this: any, ...args: any[]) {
      const startTime = new Date().getTime();
      logger(
        chalk.blue(
          printStartMessage({
            propertyName,
            time: startTime,
          }),
        ),
      );
      const result = await originalMethod.apply(this, ...args);
      const finishTime = new Date().getTime();
      logger(
        chalk.green(
          printFinishMessage({
            propertyName,
            time: finishTime - startTime,
          }),
        ),
      );
      return result;
    };
    return descriptor;
  };
}

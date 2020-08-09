import * as chalk from 'chalk';

interface MessageOptions {
  propertyName: string | unknown;
  time: number;
}

interface TraceMethodTimeOptions {
  logger?: (message?: string, ...optionalParams: unknown[]) => void;
  printStartMessage?: (options: MessageOptions) => string;
  printFinishMessage?: (options: MessageOptions) => string;
}

export function TraceMethodTime({
  logger = console.log,
  printStartMessage = ({ propertyName }: MessageOptions) =>
    `Start "${propertyName}" method`,
  printFinishMessage = ({ propertyName, time }: MessageOptions) =>
    `Finish "${propertyName}" in time: ${time}ms`,
}: TraceMethodTimeOptions = {}): MethodDecorator {
  return function (
    target: object,
    propertyName: string | unknown,
    // eslint-disable-next-line
    descriptor: TypedPropertyDescriptor<any>,
    // eslint-disable-next-line
  ): TypedPropertyDescriptor<any> {
    if (!descriptor?.value) {
      throw new Error(
        `Decorator "@TraceMethodTime" can trace time only on method`,
      );
    }
    const originalMethod = descriptor.value;
    descriptor.value = async function (this: unknown, ...args: unknown[]) {
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

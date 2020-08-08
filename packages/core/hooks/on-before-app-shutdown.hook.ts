import iterate from 'iterare';
import { isNil } from '@uzert/helpers';
import { Module } from '../injector/module';
import { OnBeforeAppShutdown } from '../interfaces';
import { getInstances } from '../utils/get-instances';

function hasOnBeforeAppShutdownHook(
  instance: unknown,
): instance is OnBeforeAppShutdown {
  return !isNil((instance as OnBeforeAppShutdown).onBeforeAppShutdown);
}

function callOperator(
  instances: OnBeforeAppShutdown[],
  err: Error | null,
  signal?: string,
): Promise<any>[] {
  return iterate(instances)
    .filter((instance) => !isNil(instance))
    .filter(hasOnBeforeAppShutdownHook)
    .map(async (instance) => instance.onBeforeAppShutdown(err, signal))
    .toArray();
}

export async function callBeforeAppShutdownHook(
  module: Module,
  err: Error | null,
  signal?: string,
): Promise<any> {
  const instanceWrappersDictionary = [
    ...module.controllers,
    ...module.providers,
    ...module.injectables,
    ...module.routes,
  ];

  await Promise.all(
    callOperator(getInstances(instanceWrappersDictionary), err, signal),
  );
}

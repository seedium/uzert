import iterate from 'iterare';
import { isNil } from '@uzert/helpers';
import { Module } from '../injector/module';
import { OnAppShutdown } from '../interfaces';
import { getInstances } from '../utils/get-instances';

function hasOnAppShutdownHook(instance: unknown): instance is OnAppShutdown {
  return !isNil((instance as OnAppShutdown).onAppShutdown);
}

function callOperator(
  instances: unknown[],
  err: Error | null,
  signal?: string,
): Promise<unknown>[] {
  return iterate(instances)
    .filter((instance) => !isNil(instance))
    .filter(hasOnAppShutdownHook)
    .map(async (instance) =>
      (instance as OnAppShutdown).onAppShutdown(err, signal),
    )
    .toArray();
}

export async function callAppShutdownHook(
  module: Module,
  err: Error | null,
  signal?: string,
): Promise<void> {
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

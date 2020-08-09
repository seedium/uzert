import iterate from 'iterare';
import { isNil } from '@uzert/helpers';
import { Module } from '../injector/module';
import { OnDispose } from '../interfaces';
import { getInstances } from '../utils/get-instances';

function hasOnDisposeHook(instance: unknown): instance is OnDispose {
  return !isNil((instance as OnDispose).onDispose);
}

function callOperator(instances: unknown[]): Promise<unknown>[] {
  return iterate(instances)
    .filter((instance) => !isNil(instance))
    .filter(hasOnDisposeHook)
    .map(async (instance) => (instance as OnDispose).onDispose())
    .toArray();
}

export async function callDisposeHook(module: Module): Promise<void> {
  const instanceWrappersDictionary = [
    ...module.controllers,
    ...module.providers,
    ...module.injectables,
    ...module.routes,
  ];

  await Promise.all(callOperator(getInstances(instanceWrappersDictionary)));
}

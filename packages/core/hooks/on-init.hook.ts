import iterate from 'iterare';
import { isNil } from '@uzert/helpers';
import { Module } from '../injector/module';
import { OnInit } from '../interfaces';
import { getInstances } from '../utils/get-instances';

function hasOnDisposeHook(instance: unknown): instance is OnInit {
  return !isNil((instance as OnInit).onInit);
}

function callOperator(instances: unknown[]): Promise<unknown>[] {
  return iterate(instances)
    .filter((instance) => !isNil(instance))
    .filter(hasOnDisposeHook)
    .map(async (instance) => (instance as OnInit).onInit())
    .toArray();
}

export async function callInitHook(module: Module): Promise<void> {
  const instanceWrappersDictionary = [
    ...module.controllers,
    ...module.providers,
    ...module.injectables,
    ...module.routes,
  ];

  await Promise.all(callOperator(getInstances(instanceWrappersDictionary)));
}

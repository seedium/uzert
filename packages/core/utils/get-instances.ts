import iterate from 'iterare';
import { InstanceWrapper } from '../injector/instance-wrapper';
import { ProviderStaticToken } from '../interfaces/modules';

export function getInstances<T = unknown>(
  instances: [ProviderStaticToken, InstanceWrapper<T>][],
): T[] {
  return iterate(instances)
    .map(([, { instance }]) => instance)
    .toArray();
}

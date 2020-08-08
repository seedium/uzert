import iterate from 'iterare';
import { InstanceWrapper } from '../injector/instance-wrapper';

export function getInstances<T = any>(
  instances: [string, InstanceWrapper][],
): T[] {
  return iterate(instances)
    .map(([key, { instance }]) => instance)
    .toArray();
}

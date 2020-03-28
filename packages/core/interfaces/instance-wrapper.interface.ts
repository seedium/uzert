import { InstanceWrapper } from '../injector/instance-wrapper';

export interface ContextId {
  readonly id: number;
}

export interface InstancePerContext<T> {
  instance: T;
  isResolved?: boolean;
  isPending?: boolean;
  donePromise?: Promise<void>;
}

export interface PropertyMetadata {
  key: string;
  wrapper: InstanceWrapper;
}

export interface InstanceMetadataStore {
  dependencies?: InstanceWrapper[];
  properties?: PropertyMetadata[];
  enhancers?: InstanceWrapper[];
}

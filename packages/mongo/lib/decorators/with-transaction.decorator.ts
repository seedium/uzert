import { SessionOptions } from 'mongodb';

export function WithTransaction(options: SessionOptions): MethodDecorator {
  return (target, key, descriptor) => {

  };
}

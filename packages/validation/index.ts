import 'reflect-metadata';

export * from './adapters';
export * from './decorators';
export * from './errors';
export * from './utils';
export * from './interfaces';
export * from './providers';
export * from './constants';

// TODO remove when DI become available
import Validation from './providers/validation.provider';

export default Validation;

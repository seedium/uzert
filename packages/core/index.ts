import 'reflect-metadata';

export * from './interfaces';
export * from './providers';

// TODO remove when DI become available
import Boot from './providers/boot';

export default Boot;

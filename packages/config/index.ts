import 'reflect-metadata';

export * from './providers';
export * from './interfaces';

// TODO remove when DI become available
import Config from './providers/config.provider';

export default Config;

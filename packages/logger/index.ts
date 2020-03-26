import 'reflect-metadata';

export * from './interfaces';
export * from './loggers';
export * from './serializers';
export * from './providers';

// TODO remove when DI become available
import Logger from './providers/logger.provider';

export default Logger;

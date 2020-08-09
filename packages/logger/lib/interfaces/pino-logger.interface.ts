import { LoggerOptions as PinoLoggerOptions } from 'pino';
import { LoggerOptionsBase } from './logger.interface';

interface ExtreameModePinoOptions {
  enabled?: boolean;
  tick?: number;
}

export interface ExtendedPinoOptions
  extends PinoLoggerOptions,
    LoggerOptionsBase {
  extremeMode?: ExtreameModePinoOptions;
}

export type PinoEventHandler = (
  error: Error | null,
  ...args: unknown[]
) => void;

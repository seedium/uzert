import { LoggerOptions as PinoLoggerOptions } from 'pino';

interface ExtreameModePinoOptions {
  enabled?: boolean;
  tick?: number;
}

export interface ExtendedPinoOptions extends PinoLoggerOptions {
  extremeMode?: ExtreameModePinoOptions;
}

export interface ILoggerOptions {
  pino?: ExtendedPinoOptions;
}

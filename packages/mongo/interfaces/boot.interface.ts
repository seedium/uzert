import { ErrorObject } from 'ajv';

export type IErrorHandler = (errors?: ErrorObject[] | null) => void;

export interface IBootstrapOptions {
  basePath?: string;
  pattern?: string;
  useAbsolute?: boolean;
  errorHandler?: IErrorHandler;
}

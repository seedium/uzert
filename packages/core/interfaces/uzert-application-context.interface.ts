import { Type } from './provider.interface';
import { Abstract } from './abstract.interface';

export interface IUzertApplicationContext {
  /**
   * Retrieves an instance of either injectable or controller, otherwise, throws exception.
   * @returns {TResult}
   */
  get<TInput = any, TResult = TInput>(
    typeOrToken: Type<TInput> | Abstract<TInput> | string | symbol,
    options?: { strict: boolean },
  ): TResult;

  /**
   * Resolves transient or request-scoped instance of either injectable or controller, otherwise, throws exception.
   * @returns {Promise<TResult>}
   */
  resolve<TInput = any, TResult = TInput>(
    typeOrToken: Type<TInput> | Abstract<TInput> | string | symbol,
    contextId?: { id: number },
    options?: { strict: boolean },
  ): Promise<TResult>;

  /**
   * Terminates the application
   * @returns {Promise<void>}
   */
  close(): Promise<void>;

  /**
   * Initalizes the Uzert application.
   * Calls the Uzert lifecycle events.
   * It isn't mandatory to call this method directly.
   *
   * @returns {Promise<this>} The UzertApplicationContext instance as Promise
   */
  init(): Promise<this>;
}

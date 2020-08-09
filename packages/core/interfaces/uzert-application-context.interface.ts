import { Type } from './provider.interface';
import { Abstract } from './abstract.interface';

export interface IUzertApplicationContext {
  /**
   * Retrieves an instance of either injectable or controller, otherwise, throws exception.
   * @returns {TResult}
   */
  get<TInput = unknown, TResult = TInput>(
    typeOrToken: Type<TInput> | Abstract<TInput> | string | symbol,
    options?: { strict: boolean },
  ): TResult;

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

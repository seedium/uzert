import iterate from 'iterare';
import { ContainerScanner, UzertContainer } from './injector';
import { Type, Abstract, IUzertApplicationContext } from './interfaces';
import { ShutdownSignal } from './enums';
import {
  callInitHook,
  callAppShutdownHook,
  callBeforeAppShutdownHook,
  callDisposeHook,
} from './hooks';
import { isString } from '@uzert/helpers';

export class UzertApplicationContext implements IUzertApplicationContext {
  protected isInitialized = false;
  private shutdownCleanupRef?: (...args: unknown[]) => unknown;
  private readonly containerScanner: ContainerScanner;
  private readonly activeShutdownSignals = new Array<string>();

  get container() {
    return this._container;
  }
  constructor(private readonly _container: UzertContainer) {
    this.containerScanner = new ContainerScanner(_container);
  }
  public get<TInput = unknown, TResult = TInput>(
    typeOrToken: Type<TInput> | Abstract<TInput> | string | symbol,
    options: { strict: boolean } = { strict: false },
  ): TResult {
    return this.find<TInput, TResult>(typeOrToken);
  }
  public async init(): Promise<this> {
    if (this.isInitialized) {
      return this;
    }

    await this.callInitHook();
    this.isInitialized = true;

    return this;
  }
  public async close(): Promise<void> {
    await this.startShutdownCycle(null);
    this.unsubscribeFromProcessSignals();
  }
  public enableShutdownHooks(signals: (ShutdownSignal | string)[] = []): this {
    if (!signals.length) {
      signals = Object.keys(ShutdownSignal).map(
        (key: string) => ShutdownSignal[key],
      );
    } else {
      signals = Array.from(new Set(signals));
    }

    signals = iterate(signals)
      .map((signal: string) => signal.toString().trim())
      // filter out the signals which is already listening to
      .filter((signal) => !this.activeShutdownSignals.includes(signal))
      .toArray();

    this.listenToShutdownSignals(signals);
    return this;
  }
  protected find<TInput = unknown, TResult = TInput>(
    typeOrToken: Type<TInput> | Abstract<TInput> | string | symbol,
  ): TResult {
    return this.containerScanner.find<TInput, TResult>(typeOrToken);
  }
  protected async dispose(): Promise<void> {
    // Uzert application context has no server
    // to dispose, therefore just call a noop
    return Promise.resolve();
  }
  protected listenToShutdownSignals(signals: (ShutdownSignal | string)[]) {
    const cleanup = async (signalOrError: Error | string) => {
      let error: Error = null;
      let signal: string;
      if (isString(signalOrError)) {
        signal = signalOrError;
      } else {
        error = signalOrError;
      }
      try {
        signals.forEach((sig) => process.removeListener(sig, cleanup));
        await this.startShutdownCycle(error, signal);
        if (error) {
          return this.logAndExit(error);
        }
        process.kill(process.pid, signal);
      } catch (err) {
        this.logAndExit(err);
      }
    };
    this.shutdownCleanupRef = cleanup as (...args: unknown[]) => unknown;
    signals.forEach((signal: string) => {
      this.activeShutdownSignals.push(signal);
      process.on(signal, cleanup);
    });
  }
  protected async startShutdownCycle(
    err: Error | null,
    signal?: ShutdownSignal | string,
  ) {
    await this.callBeforeShutdownHook(err, signal);
    await this.dispose();
    await this.callShutdownHook(err, signal);
    await this.callDisposeHook();
  }
  protected unsubscribeFromProcessSignals() {
    if (!this.shutdownCleanupRef) {
      return;
    }
    this.activeShutdownSignals.forEach((signal) => {
      process.removeListener(signal, this.shutdownCleanupRef);
    });
  }
  protected async callInitHook(): Promise<void> {
    const modulesContainer = this.container.getModules();
    for (const module of [...modulesContainer.values()].reverse()) {
      await callInitHook(module);
    }
  }
  protected async callDisposeHook(): Promise<void> {
    const modulesContainer = this.container.getModules();
    for (const module of modulesContainer.values()) {
      await callDisposeHook(module);
    }
  }
  protected async callShutdownHook(
    err: Error | null,
    signal?: string,
  ): Promise<void> {
    const modulesContainer = this.container.getModules();
    for (const module of [...modulesContainer.values()].reverse()) {
      await callAppShutdownHook(module, err, signal);
    }
  }
  protected async callBeforeShutdownHook(
    err: Error | null,
    signal?: string,
  ): Promise<void> {
    const modulesContainer = this.container.getModules();
    for (const module of [...modulesContainer.values()].reverse()) {
      await callBeforeAppShutdownHook(module, err, signal);
    }
  }
  protected logAndExit(err: Error): void {
    console.error(err);
    process.exit(1);
  }
}

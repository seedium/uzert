import { promisify } from 'util';
import { FactoryProvider, Injectable } from '@uzert/core';
import { CustomServiceOptions } from '../interfaces/service.interface';

const delay = promisify(setTimeout);

@Injectable()
export class CustomService {
  static boot(options: CustomServiceOptions): FactoryProvider<CustomService> {
    return {
      provide: CustomService,
      useFactory: async () => {
        await delay(100);
        return new CustomService(options);
      },
    };
  }
  constructor(public readonly options: CustomServiceOptions) {}
}

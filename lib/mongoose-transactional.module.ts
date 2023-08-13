import { DynamicModule, Module } from '@nestjs/common';

import { IMongooseTransactionalModuleOptions } from './interfaces/mongoose-transactional-module-options.interface';

@Module({})
export class MongooseTransactionalModule {
  static forRoot(options: IMongooseTransactionalModuleOptions): DynamicModule {
    return {
      global: options?.global ?? true,
      module: MongooseTransactionalModule,
      providers: [],
      exports: [],
    };
  }
}

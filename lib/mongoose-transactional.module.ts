import { DynamicModule, Module } from '@nestjs/common';

import { IMongooseTransactionalModuleOptions } from './interfaces/mongoose-transactional-module-options.interface';
import { LOGGER_SERVICE_NAME } from './provide-names.constants';
import { MongooseTransactionalLoggerService } from './services/mongoose-transactional-logger.service';

@Module({})
export class MongooseTransactionalModule {
  static forRoot(options: IMongooseTransactionalModuleOptions): DynamicModule {
    return {
      imports: options.imports ?? [],
      global: options?.global ?? true,
      module: MongooseTransactionalModule,
      providers: [
        {
          provide: LOGGER_SERVICE_NAME,
          useClass: options.injectLoggerClass,
        },
        MongooseTransactionalLoggerService,
      ],
      exports: [MongooseTransactionalLoggerService],
    };
  }
}

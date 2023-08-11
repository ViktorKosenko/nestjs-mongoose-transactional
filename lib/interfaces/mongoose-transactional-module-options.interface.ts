import { DynamicModule } from '@nestjs/common/interfaces/modules/dynamic-module.interface';
import { ForwardReference } from '@nestjs/common/interfaces/modules/forward-reference.interface';
import { Type } from '@nestjs/common/interfaces/type.interface';
import { IMongooseTransactionalLogger } from './mongoose-transactional-logger.interface';

export interface IMongooseTransactionalModuleOptions {
  imports?: Array<
    Type<any> | DynamicModule | Promise<DynamicModule> | ForwardReference
  >;
  global?: boolean;
  injectLoggerClass: Type<IMongooseTransactionalLogger>;
}

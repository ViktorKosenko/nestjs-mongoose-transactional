/* eslint-disable @typescript-eslint/no-explicit-any */
import { Inject, Injectable } from '@nestjs/common';

import { IMongooseTransactionalLogger } from '../interfaces/mongoose-transactional-logger.interface';
import { LOGGER_SERVICE_NAME } from '../provide-names.constants';

@Injectable()
export class MongooseTransactionalLoggerService
  implements IMongooseTransactionalLogger
{
  constructor(
    @Inject(LOGGER_SERVICE_NAME)
    private readonly logger: IMongooseTransactionalLogger,
  ) {}

  setContext(context = 'LOGGER_SERVICE_NAME'): void {
    this.logger.setContext(context);
  }

  error(
    method: string,
    error: string | Error | unknown,
    meta?: string | Record<string, any> | Error,
  ): void {
    this.logger.error(method, error, meta);
  }

  warn(
    method: string,
    message: string | Record<string, any> | [],
    meta?: string | Record<string, any>,
  ): void {
    this.logger.warn(method, message, meta);
  }
}

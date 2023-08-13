import { Connection } from 'mongoose';

import { sessionStorage } from '../storages/transactional-session.storage';

/**
 * Decorator for wrapping method in mongoose transaction if it is not already wrapped
 * and session is not exists in async local storage
 *
 * Important: for using this decorator need add mongooseConnection: Connection to class
 *
 * Important: for getting access to session you should use decorator AddSessionToLastArguments
 * after this decorator to add session to last argument of method with query or aggregation pipeline
 *
 * Important: this decorator delete all metadata from another decorators
 * (Example: If you override descriptor.value, SwaggerModule wouldn't be able to
 * access the metadata defined on the method.)
 *
 * @example
 * class SomeClass {
 * .@Transactional()
 * async someMethod(): Promise<void> {
 * // some code
 * await this.someAnotherMethodWithQuery(args);
 * await this.someAnotherMethodWithAggregationPipeline(args);
 * // some code
 * }
 * .@AddSessionToLastArguments()
 * async someAnotherMethodWithQuery(args, session): Promise<void> {
 * // some code
 * }
 * .@AddSessionToLastArguments()
 * async someAnotherMethodWithAggregationPipeline(args, session): Promise<void> {
 * // some code
 * }
 * }
 *
 * if you need get access to session import sessionStorage and use sessionStorage.getSession()
 *
 * @example
 * class SomeClass {
 * .@Transactional()
 * async someMethod(): Promise<void> {
 * // some code
 * const session = sessionStorage.getSession();
 * await this.someAnotherMethodWithQuery(args, session);
 * await this.someAnotherMethodWithAggregationPipeline(args, session);
 * // some code
 * }
 * async someAnotherMethodWithQuery(args, session): Promise<void> {
 * // some code
 * }
 * async someAnotherMethodWithAggregationPipeline(args, session): Promise<void> {
 * // some code
 * }
 */
export const Transactional = (): MethodDecorator => {
  return (
    _target: object,
    _methodName: string | symbol,
    descriptor: TypedPropertyDescriptor<any>,
  ) => {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: unknown[]): Promise<unknown> {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const mongooseConnection = this.mongooseConnection;
      const isMongoConnectionAlreadyExists =
        mongooseConnection instanceof Connection;
      if (!isMongoConnectionAlreadyExists) {
        return await originalMethod.apply(this, args);
      }
      if (sessionStorage.getSession()) {
        return await originalMethod.apply(this, args);
      }

      const session = await mongooseConnection.startSession();
      sessionStorage.setSession(session);
      session.startTransaction();

      try {
        const result = await originalMethod.apply(this, args);
        await session.commitTransaction();
        return result;
      } catch (error) {
        await session.abortTransaction();
        throw error;
      } finally {
        await session.endSession();
      }
    };

    return descriptor;
  };
};

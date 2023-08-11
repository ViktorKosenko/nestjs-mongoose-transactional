import { ClientSession } from 'mongodb';

import { sessionStorage } from '../storages/transactional-session.storage';

/**
 * This decorator is used to add session to last argument of method.
 *
 * Important: this decorator should be used after Transactional decorator.
 *
 * Important: use this decorator for first method in chain of methods with session argument.
 *
 * Important: this decorator delete all metadata from another decorators
 * (Example: If you override descriptor.value, SwaggerModule wouldn't be able to
 * access the metadata defined on the method.)
 *
 * @example
 *  class SomeClass {
 *  .@AddSessionToLastArguments()
 *  async someMethod(arg1: string, arg2: number, session: ClientSession): Promise<void> {
 *  // some code
 *  }
 *  }
 *  const someClass = new SomeClass();
 *  const session = await mongooseConnection.startSession();
 *  await someClass.someMethod('some string', 123, session);
 *  // or you can use this decorator
 *  await someClass.someMethod('some string', 123);
 *  // session will be added to last argument
 *
 *  @example
 *  class SomeClass {
 *  .@AddSessionToLastArguments()
 *  async someMethod(arg1: string, arg2: number, session?: ClientSession | null): Promise<void> {
 *  // some code
 *  await this.someAnotherMethod(arg1, arg2, session);
 *  // some code
 *  }
 *  .@AddSessionToLastArguments()
 *  async someAnotherMethod(arg1: string, arg2: number, session?: ClientSession | null): Promise<void> {
 *  // some code
 *  }
 */
export const AddSessionToLastArguments = () => {
  return (
    _target: object,
    _methodName: string,
    descriptor: PropertyDescriptor,
  ) => {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: unknown[]): Promise<unknown> {
      const isSessionAlreadyExists = args.some(
        (argument) => argument instanceof ClientSession,
      );
      if (isSessionAlreadyExists) {
        return await originalMethod.apply(this, args);
      }

      const session = sessionStorage.getSession();
      if (session) {
        args.push(session);
      }

      return await originalMethod.apply(this, args);
    };

    return descriptor;
  };
};

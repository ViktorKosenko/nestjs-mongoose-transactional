# nestjs-mongoose-transactional

## Install

```bash
$ npm install nestjs-mongoose-transactional
```

## Usage

Code samples not really working, just for demonstration purposes.

### Import Module

```typescript
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TransactionalModule } from 'nestjs-mongoose-transactional';
import { CatsModule } from './cats/cats.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost/nest'),
    MongooseTransactionalModule.forRoot({
      global: true,
    }),
    CatsModule,
  ],
})
```

### Use AddSessionToLastArguments

```typescript
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
//...
import { AddSessionToLastArguments } from 'nestjs-mongoose-transactional';
import { Cat } from './cat.document';

@Injectable()
export class CatsService {
  constructor(
    @InjectModel('Cat')
    private readonly model: Model<Cat>
  ) {}

  @AddSessionToLastArguments()
  async create(
    data: Partial<Cat>,
    session: ClientSession | null = null
  ): Promise<Cat> {
    return (await this.model.create([data], { session: session }))[0];
  }

  async updateOne(
    filter: FilterQuery<Cat>,
    updateQuery: UpdateQuery<Cat>,
    session: ClientSession | null = null,
    upsert = false
  ): Promise<UpdateWriteOpResult> {
    return this.model
      .updateOne(filter, updateQuery, { upsert })
      .session(session)
      .exec();
  }
}
```

### Use Transactional

```typescript
import { Injectable } from '@nestjs/common';
import { Transactional } from "nestjs-mongoose-transactional";
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class CatsManagerService {
  constructor(
    private readonly catsService: CatsService,
    private readonly anotherService: AnotherService,
    private readonly eventEmitter: EventEmitter2,
    @InjectConnection() private readonly mongooseConnection: Connection,
  ) {}

  @Transactional()
  async create(data: Partial<Cat>): Promise<Cat> {
    const createdCat = await this.catsService.create(data);
    await this.anotherService.doSomething();
    eventEmitter.emit('cat.created', createdCat);
    
    return createdCat;
  }
  
  @OnEvent('cat.created')
  async onCatCreated(cat: Cat) {
    // In this case you can get session from async local storage, 
    // but may be session is already committed and your error don't rollback transaction.
    await this.catsService.updateOne({ _id: cat._id }, { $set: { isCreated: true } });
  }
}
```

## Decorators

### Transactional

```typescript
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
export declare const Transactional: () => MethodDecorator;
```

### AddSessionToLastArguments

```typescript
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
export declare const AddSessionToLastArguments: () => (_target: object, _methodName: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
```

## sessionStorage

If you need to get access to session in another method you can use sessionStorage

```typescript
export class SomeClass {
  constructor(private readonly catsService: CatsService) {}

  @ThisDecoratorNotWorksWithAddSessionToLastArgumentsDecorator()
  async someMethod(): Promise<void> {
    // some code
    const session = sessionStorage.getSession();
    await this.catsService.someAnotherMethodWithQuery(args, session);
    await this.catsService.someAnotherMethodWithAggregationPipeline(args, session);
    // some code
  }
}
```

## License

NestJS Mongoose Transactional is [MIT licensed](LICENSE).
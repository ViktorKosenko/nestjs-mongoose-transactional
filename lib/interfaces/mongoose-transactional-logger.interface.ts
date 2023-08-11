export interface IMongooseTransactionalLogger {
  setContext: (context: string) => void;
  error: (
    method: string,
    error: string | Error | unknown,
    meta?: string | Record<string, any> | Error,
  ) => void;
  warn: (
    method: string,
    message: string | Record<string, any> | [],
    meta?: string | Record<string, any>,
  ) => void;
}

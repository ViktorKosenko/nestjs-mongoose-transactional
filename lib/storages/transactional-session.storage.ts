import { AsyncLocalStorage } from 'node:async_hooks';
import { ClientSession } from 'mongodb';

class TransactionalSessionStorage {
  private readonly storage: AsyncLocalStorage<ClientSession>;

  constructor() {
    this.storage = new AsyncLocalStorage();
  }

  getSession(): ClientSession | null {
    const session = this.storage.getStore();
    return session ?? null;
  }

  setSession(session: ClientSession): void {
    return this.storage.enterWith(session);
  }
}

export const sessionStorage = new TransactionalSessionStorage();

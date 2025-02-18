export interface IRepository<T> {
    getById(id: string): Promise<T | null>;
    getAll(): Promise<T[]>;
    create(data: T): Promise<T>;
    update(id: string, data: Partial<T>): Promise<void>;
    delete(id: string): Promise<void>;
  }
  
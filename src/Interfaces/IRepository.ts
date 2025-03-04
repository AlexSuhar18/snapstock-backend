export interface IRepository<T> {
  getById(id: string): Promise<T | null>;
  getAll(): Promise<T[]>;
  create(data: T): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T>; // 🔄 Acum returnează obiectul actualizat
  delete(id: string): Promise<T | null>; // 🔄 Acum returnează obiectul șters
}

import type { IUserRepository } from './IUserRepository';
import type { User } from '@core/entities/User';
import { JsonDataLoader } from '../JsonDataLoader';
import { normalizeUsersJson } from '../normalizers/usersNormalizer';

type UsersStore = Record<string, User[]>;

export class FileUserRepository implements IUserRepository {
  private readonly store: UsersStore;

  constructor() {
    const dataset = process.env.DATASET ?? 'default';
    const raw = JsonDataLoader.load<Record<string, unknown>>(`testdata/${dataset}/users.json`);
    this.store = normalizeUsersJson(raw);
  }

  has(key: string): boolean {
    return Array.isArray(this.store[key]) && this.store[key].length > 0;
  }

  keys(): string[] {
    return Object.keys(this.store);
  }

  get(key: string, index = 0): User {
    const users = this.store[key];
    if (!users || users.length === 0) throw new Error(`User key not found or empty: "${key}"`);
    if (!users[index]) throw new Error(`User index ${index} not found for key: "${key}"`);
    return users[index];
  }
}
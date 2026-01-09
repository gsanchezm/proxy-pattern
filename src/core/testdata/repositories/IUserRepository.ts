import type { User } from '@core/entities/User';

export interface IUserRepository {
  get(key: string, index?: number): User;
  has(key: string): boolean;
  keys(): string[];
}
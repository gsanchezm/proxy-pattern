import type { User } from '@core/entities/User';
import type { Product } from '@core/entities/Product';

import type { IUserRepository } from './repositories/IUserRepository';
import type { IProductRepository } from './repositories/IProductRepository';

import { FileUserRepository } from './repositories/FileUserRepository';
import { FileProductRepository } from './repositories/FileProductRepository';

export class TestDataFactory {
  private static userRepo: IUserRepository | null = null;
  private static productRepo: IProductRepository | null = null;

  private static users(): IUserRepository {
    if (!this.userRepo) this.userRepo = new FileUserRepository();
    return this.userRepo;
  }

  private static products(): IProductRepository {
    if (!this.productRepo) this.productRepo = new FileProductRepository();
    return this.productRepo;
  }

  // Users
  static user(key: string, index?: number): User {
    return this.users().get(key, index);
  }

  static userKeys(): string[] {
    return this.users().keys();
  }

  // Products
  static productsAll(): Product[] {
    return this.products().all();
  }

  static productByTitle(title: string): Product {
    return this.products().byTitle(title);
  }

  static productByIndex(index: number): Product {
    return this.products().byIndex(index);
  }

  static productByKey(key: string): Product {
    return this.products().byKey(key);
  }

  static productTitle(key: string): string {
    return this.products().resolveTitle(key);
  }

  static acceptableProductTitles(key: string): string[] {
    return this.products().acceptableTitles(key);
  }
}
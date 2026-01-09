import type { Product } from '@core/entities/Product';

export interface IProductRepository {
  all(): Product[];
  byTitle(title: string): Product;
  byIndex(index: number): Product;
  byKey(key: string): Product;
  resolveTitle(key: string): string;
  acceptableTitles(key: string): string[];
}
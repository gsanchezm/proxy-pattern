import type { IProductRepository } from './IProductRepository';
import type { Product } from '@core/entities/Product';
import { JsonDataLoader } from '../JsonDataLoader';
import { env } from '@core/config/env';

type ProductsJson = { products: Product[] };

type ProductsMapJson = {
  map: Record<
    string,
    {
      webTitle: string;
      mobileTitles?: string[];
    }
  >;
};

export class FileProductRepository implements IProductRepository {
  private readonly store: ProductsJson;
  private readonly map: ProductsMapJson['map'];

  constructor() {
    const dataset = process.env.DATASET ?? 'default';

    this.store = JsonDataLoader.load<ProductsJson>(`testdata/${dataset}/products.json`);

    // products.map.json is required for key-based scenarios
    const mapJson = JsonDataLoader.load<ProductsMapJson>(`testdata/${dataset}/products.map.json`);
    this.map = mapJson.map ?? {};
  }

  all(): Product[] {
    return this.store.products ?? [];
  }

  byTitle(title: string): Product {
    const p = this.all().find(x => x.title === title);
    if (!p) throw new Error(`Product not found by title: "${title}"`);
    return p;
  }

  byIndex(index: number): Product {
    const p = this.all()[index];
    if (!p) throw new Error(`Product not found at index: ${index}`);
    return p;
  }

  // --------------------------
  // ✅ New key-based API
  // --------------------------

  byKey(key: string): Product {
    const entry = this.map[key];
    if (!entry?.webTitle) {
      throw new Error(`Product key not found in products.map.json: "${key}"`);
    }
    // canonical product is always the webTitle from products.json
    return this.byTitle(entry.webTitle);
  }

  resolveTitle(key: string): string {
    const entry = this.map[key];
    if (!entry?.webTitle) {
      throw new Error(`Product key not found in products.map.json: "${key}"`);
    }

    // Web uses canonical title
    if (env.driver === 'playwright') return entry.webTitle;

    // Mobile prefers the first variant if provided, otherwise fallback to webTitle
    const mobileTitles = entry.mobileTitles ?? [];
    return mobileTitles[0] ?? entry.webTitle;
  }

  acceptableTitles(key: string): string[] {
    const entry = this.map[key];
    if (!entry?.webTitle) {
      throw new Error(`Product key not found in products.map.json: "${key}"`);
    }

    // Web: only canonical title
    if (env.driver === 'playwright') return [entry.webTitle];

    // Mobile: all variants + canonical fallback
    const mobile = entry.mobileTitles ?? [];
    const set = new Set<string>([...mobile, entry.webTitle]);
    return Array.from(set);
  }
}
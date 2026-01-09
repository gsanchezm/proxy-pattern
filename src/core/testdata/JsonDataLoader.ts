import fs from 'fs';
import path from 'path';

export class JsonDataLoader {
  private static cache = new Map<string, unknown>();

  static load<T>(relativePathFromSrc: string): T {
    const filePath = path.resolve(process.cwd(), 'src', relativePathFromSrc);

    if (this.cache.has(filePath)) {
      return this.cache.get(filePath) as T;
    }

    const raw = fs.readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(raw) as T;

    this.cache.set(filePath, parsed);
    return parsed;
  }
}
import fs from 'fs';
import path from 'path';
import { env } from '@core/config/env';

export class LocatorResolver {
  static resolve(
    featureFolder: string,
    locatorFile: string,
    key: string
  ): { selector: string; resolvedFor: string } {

    const file = path.resolve(`src/features/${featureFolder}/${locatorFile}.locators.json`);
    const json = JSON.parse(fs.readFileSync(file, 'utf-8'));

    const entry = json[key];
    if (!entry) {
      throw new Error(`Locator not found: ${key} in ${locatorFile}.locators.json`);
    }

    if (env.platform === 'web') {
      if (typeof entry.web === 'string') {
        return { selector: entry.web, resolvedFor: 'web' };
      }
      return {
        selector: entry.web[env.viewport!],
        resolvedFor: `web.${env.viewport}`
      };
    }

    return {
      selector: entry.mobile[env.platform],
      resolvedFor: env.platform
    };
  }
}
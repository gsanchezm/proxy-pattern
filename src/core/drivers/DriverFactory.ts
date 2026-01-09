import { env } from '@core/config/env';
import { PlaywrightAdapter } from './playwright.adapter';
import { AppiumAdapter } from './appium.adapter';

export class DriverFactory {
  static async init() {
    if (env.driver === 'playwright') return PlaywrightAdapter.init();
    if (env.driver === 'appium') return AppiumAdapter.init();
    throw new Error(`Unsupported driver: ${env.driver}`);
  }

  static getPage() {
    if (env.driver !== 'playwright') throw new Error('getPage() only for Playwright');
    return PlaywrightAdapter.getPage();
  }

  static getMobileDriver() {
    if (env.driver !== 'appium') throw new Error('getMobileDriver() only for Appium');
    return AppiumAdapter.getDriver();
  }

  static async close() {
    if (env.driver === 'playwright') return PlaywrightAdapter.close();
    if (env.driver === 'appium') return AppiumAdapter.close();
  }
}
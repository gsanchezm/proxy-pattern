import { chromium, Page, Browser } from 'playwright';
import { env } from '@core/config/env';

export class PlaywrightAdapter {
  private static browser: Browser;
  private static page: Page;

  static async init() {
    const headless = (process.env.HEADLESS ?? 'true') === 'true';
    const slowMo = Number(process.env.SLOWMO ?? '0');

    // If you want full-screen in desktop, we’ll handle below
    const isResponsive = env.viewport === 'responsive';

    this.browser = await chromium.launch({
      headless,
      slowMo,
      args: isResponsive ? [] : ['--start-maximized'] // desktop maximized
    });

    const context = await this.browser.newContext({
      // Responsive = iPhone-ish viewport + touch/mobile hints
      ...(isResponsive
        ? {
            viewport: { width: 390, height: 844 },
            isMobile: true,
            hasTouch: true
            // userAgent: '...' // optional
          }
        : {
            viewport: null // important: allows real window size (with --start-maximized)
          })
    });

    this.page = await context.newPage();

    await this.page.goto(env.baseUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 30_000
    });
  }

  static getPage(): Page {
    return this.page;
  }

  static async close() {
    await this.browser?.close();
  }
}
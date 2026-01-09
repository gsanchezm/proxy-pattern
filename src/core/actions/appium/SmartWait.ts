import { DriverFactory } from '@core/drivers/DriverFactory';

export class SmartWait {
  static async element(selector: string, timeoutMs = 10_000) {
    const driver = DriverFactory.getMobileDriver();
    const el = await driver.$(selector);
    await el.waitForDisplayed({ timeout: timeoutMs });
    return el;
  }

  /** Wait until at least one element exists (and best-effort displayed) */
  static async elements(selector: string, timeoutMs = 5000, intervalMs = 250) {
    const driver = DriverFactory.getMobileDriver();

    await driver.waitUntil(
      async () => {
        const els = driver.$$(selector);
        const count = await els.length;
        return count > 0;
      },
      {
        timeout: timeoutMs,
        interval: intervalMs,
        timeoutMsg: `SmartWait.elements: no elements found for selector "${selector}" after ${timeoutMs}ms`
      }
    );

    const els = await driver.$$(selector);       // ✅ await: real array

    // best-effort: ensure first is displayed
    try {
      await els[0].waitForDisplayed({ timeout: Math.min(2000, timeoutMs) });
    } catch {
      // ignore
    }

    return els;
  }
}
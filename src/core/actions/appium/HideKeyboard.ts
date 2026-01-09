import type { ActionHandler, ActionContext } from '../ActionHandler';
import { DriverFactory } from '@core/drivers/DriverFactory';
import { env } from '@core/config/env';

export class HideKeyboard implements ActionHandler {
  name = 'hideKeyboard';

  async execute(_ctx: ActionContext) {
    const driver = DriverFactory.getMobileDriver();

    // Only needed on iOS for your simulator behavior
    if (env.platform === 'ios') {
      // Strategy 1: keys(['Escape'])
      try {
        await driver.keys(['Escape']);
        return;
      } catch {}

      // Strategy 2: Unicode ESC (some drivers expect this)
      try {
        // WebDriver "Escape" key constant is often \uE00C
        await driver.keys(['\uE00C']);
        return;
      } catch {}

      // Strategy 3: tap a safe point ABOVE keyboard to blur inputs
      // (works even when keyboard can't be programmatically dismissed)
      try {
        const { height, width } = await driver.getWindowSize();
        const x = Math.round(width / 2);
        const y = 120; // near top, away from keyboard and fields
        await driver.execute('mobile: tap', { x, y });
        return;
      } catch {}

      // Strategy 4: do nothing (never fail)
      return;
    }

    // Android (best effort)
    try {
      await (driver as any).hideKeyboard();
    } catch {
      // never fail
    }
  }
}
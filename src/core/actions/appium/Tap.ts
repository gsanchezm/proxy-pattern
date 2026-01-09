import type { ActionHandler, ActionContext } from '../ActionHandler';
import { DriverFactory } from '@core/drivers/DriverFactory';
import { env } from '@core/config/env';
import { SmartWait } from './SmartWait';

export class Tap implements ActionHandler {
  name = 'tap';

  async execute(ctx: ActionContext) {
    const driver = DriverFactory.getMobileDriver();
    const el = await SmartWait.element(ctx.selector);

    // iOS: tap element center via coordinates (more reliable when keyboard overlays)
    if (env.platform === 'ios') {
      try {
        const loc = await el.getLocation(); // { x, y }
        const size = await el.getSize();    // { width, height }

        const x = Math.round(loc.x + size.width / 2);
        const y = Math.round(loc.y + size.height / 2);

        await driver.execute('mobile: tap', { x, y });
        return;
      } catch {
        // fall back to regular click below
      }
    }

    // default
    await el.click();
  }
}
import type { ActionHandler, ActionContext } from '../ActionHandler';
import { DriverFactory } from '@core/drivers/DriverFactory';

export class Press implements ActionHandler {
  name = 'press';

  async execute(ctx: ActionContext) {
    const page = DriverFactory.getPage();
    const key = String(ctx.args?.[0] ?? 'Enter'); // default Enter
    await page.locator(ctx.selector).press(key);
  }
}
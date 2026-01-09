import type { ActionHandler, ActionContext } from '../ActionHandler';
import { DriverFactory } from '@core/drivers/DriverFactory';

export class WaitVisible implements ActionHandler {
  name = 'waitVisible';

  async execute(ctx: ActionContext) {
    const page = DriverFactory.getPage();
    const timeout = Number(ctx.args?.[0] ?? 10_000);
    await page.locator(ctx.selector).waitFor({ state: 'visible', timeout });
  }
}
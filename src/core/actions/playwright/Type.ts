import type { ActionHandler, ActionContext } from '../ActionHandler';
import { DriverFactory } from '@core/drivers/DriverFactory';

export class Type implements ActionHandler {
  name = 'type';

  async execute(ctx: ActionContext) {
    const page = DriverFactory.getPage();
    const locator = page.locator(ctx.selector);
    const value = String(ctx.args?.[0] ?? '');

    // Mandatory clear before typing (explicit policy)
    await locator.fill('');
    await locator.fill(value);
  }
}
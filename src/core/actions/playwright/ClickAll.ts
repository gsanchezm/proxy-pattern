import type { ActionHandler, ActionContext } from '../ActionHandler';
import { DriverFactory } from '@core/drivers/DriverFactory';

export class ClickAll implements ActionHandler {
  name = 'clickAll';

  async execute(ctx: ActionContext) {
    const page = DriverFactory.getPage();
    const loc = page.locator(ctx.selector);
    const count = await loc.count();

    for (let i = 0; i < count; i++) {
      await loc.nth(i).click();
    }
  }
}
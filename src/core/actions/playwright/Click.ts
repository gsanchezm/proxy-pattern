import type { ActionHandler, ActionContext } from '../ActionHandler';
import { DriverFactory } from '@core/drivers/DriverFactory';

export class Click implements ActionHandler {
  name = 'click';

  async execute(ctx: ActionContext) {
    const page = DriverFactory.getPage();
    await page.locator(ctx.selector).click();
  }
}
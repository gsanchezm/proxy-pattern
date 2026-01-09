import type { ActionHandler, ActionContext } from '../ActionHandler';
import { DriverFactory } from '@core/drivers/DriverFactory';

export class Count implements ActionHandler {
  name = 'count';

  async execute(ctx: ActionContext) {
    const page = DriverFactory.getPage();
    return page.locator(ctx.selector).count();
  }
}
import type { ActionHandler, ActionContext } from '../ActionHandler';
import { DriverFactory } from '@core/drivers/DriverFactory';

export class GetText implements ActionHandler {
  name = 'getText';

  async execute(ctx: ActionContext) {
    const page = DriverFactory.getPage();
    return page.locator(ctx.selector).innerText();
  }
}
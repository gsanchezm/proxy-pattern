import type { ActionHandler, ActionContext } from '../ActionHandler';
import { DriverFactory } from '@core/drivers/DriverFactory';

export class ClickNth implements ActionHandler {
  name = 'clickNth';

  async execute(ctx: ActionContext) {
    const index = Number(ctx.args?.[0]);
    if (!Number.isFinite(index) || index < 0) {
      throw new Error('clickNth requires args[0] = non-negative number index');
    }

    const page = DriverFactory.getPage();
    const list = page.locator(ctx.selector);
    const count = await list.count();

    if (index >= count) {
      throw new Error(`clickNth index out of range. index=${index}, count=${count}, selector="${ctx.selector}"`);
    }

    await list.nth(index).click();
  }
}
import type { ActionHandler, ActionContext } from '../ActionHandler';
import { DriverFactory } from '@core/drivers/DriverFactory';

export class SelectByText implements ActionHandler {
  name = 'selectByText';

  async execute(ctx: ActionContext) {
    const page = DriverFactory.getPage();
    const expectedRaw = String(ctx.args?.[0] ?? '').trim();
    if (!expectedRaw) throw new Error('selectByText requires a text value');

    const list = page.locator(ctx.selector);
    const count = await list.count();

    for (let i = 0; i < count; i++) {
      const item = list.nth(i);
      const text = (await item.innerText()).trim();
      if (text === expectedRaw) {
        await item.click();
        return;
      }
    }

    throw new Error(`selectByText: item with text "${expectedRaw}" not found for selector: ${ctx.selector}`);
  }
}
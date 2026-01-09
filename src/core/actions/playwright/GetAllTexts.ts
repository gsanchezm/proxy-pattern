import type { ActionHandler, ActionContext } from '../ActionHandler';
import { DriverFactory } from '@core/drivers/DriverFactory';

export class GetAllTexts implements ActionHandler {
  name = 'getAllTexts';

  async execute(ctx: ActionContext) {
    const page = DriverFactory.getPage();
    const loc = page.locator(ctx.selector);
    const n = await loc.count();

    const out: string[] = [];
    for (let i = 0; i < n; i++) {
      out.push((await loc.nth(i).innerText()).trim());
    }
    return out;
  }
}
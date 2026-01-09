import type { ActionHandler, ActionContext } from '../ActionHandler';
import { SmartWait } from './SmartWait';

export class ClickAll implements ActionHandler {
  name = 'clickAll';

  async execute(ctx: ActionContext) {
    const els = await SmartWait.elements(ctx.selector, 5000);
    for (const el of els) {
      await el.click();
    }
  }
}

import type { ActionHandler, ActionContext } from '../ActionHandler';
import { SmartWait } from './SmartWait';

export class Count implements ActionHandler {
  name = 'count';

  async execute(ctx: ActionContext) {
    const list = await SmartWait.elements(ctx.selector, 5000);
    return await list.length;
  }
}
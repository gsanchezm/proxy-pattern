import type { ActionHandler, ActionContext } from '../ActionHandler';
import { SmartWait } from './SmartWait';

export class WaitVisible implements ActionHandler {
  name = 'waitVisible';

  async execute(ctx: ActionContext) {
    const timeout = Number(ctx.args?.[0] ?? 5000);
    await SmartWait.element(ctx.selector, timeout);
  }
}
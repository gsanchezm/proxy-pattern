import type { ActionHandler, ActionContext } from '../ActionHandler';
import { SmartWait } from './SmartWait';

export class ClickNth implements ActionHandler {
  name = 'clickNth';

  async execute(ctx: ActionContext) {
    const index = Number(ctx.args?.[0]);
    const timeoutMs = Number(ctx.args?.[1] ?? 5000);

    if (!Number.isFinite(index) || index < 0) {
      throw new Error('clickNth requires args[0] = non-negative number index');
    }

    const list = await SmartWait.elements(ctx.selector, timeoutMs);

    if (index >= await list.length) {
      throw new Error(`clickNth index out of range. index=${index}, count=${list.length}, selector="${ctx.selector}"`);
    }

    const el = list[index];
    await el.waitForDisplayed({ timeout: timeoutMs });
    await el.click();

  }
}
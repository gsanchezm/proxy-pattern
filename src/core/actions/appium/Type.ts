import type { ActionHandler, ActionContext } from '../ActionHandler';
import { SmartWait } from './SmartWait';

export class Type implements ActionHandler {
  name = 'type';

  async execute(ctx: ActionContext) {
    const value = String(ctx.args?.[0] ?? '');
    const el = await SmartWait.element(ctx.selector);
    await el.clearValue();
    await el.setValue(value);
  }
}
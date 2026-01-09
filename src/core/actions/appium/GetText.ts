import type { ActionHandler, ActionContext } from '../ActionHandler';
import { SmartWait } from './SmartWait';

export class GetText implements ActionHandler {
  name = 'getText';

  async execute(ctx: ActionContext) {
    const el = await SmartWait.element(ctx.selector);
    return el.getText();
  }
}
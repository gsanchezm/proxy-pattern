import type { ActionHandler, ActionContext } from '../ActionHandler';
import assert from 'node:assert/strict';
import { SmartWait } from './SmartWait';

export class AssertVisible implements ActionHandler {
  name = 'assertVisible';

  async execute(ctx: ActionContext) {
    const el = await SmartWait.element(ctx.selector);
    const visible = await el.isDisplayed();
    assert.equal(visible, true, `Expected element to be visible: ${ctx.selector}`);
  }
}
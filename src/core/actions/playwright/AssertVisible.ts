import type { ActionHandler, ActionContext } from '../ActionHandler';
import { DriverFactory } from '@core/drivers/DriverFactory';
import assert from 'node:assert/strict';

export class AssertVisible implements ActionHandler {
  name = 'assertVisible';

  async execute(ctx: ActionContext) {
    const page = DriverFactory.getPage();
    const locator = page.locator(ctx.selector);
    const visible = await locator.isVisible();
    assert.equal(visible, true, `Expected element to be visible: ${ctx.selector}`);
  }
}
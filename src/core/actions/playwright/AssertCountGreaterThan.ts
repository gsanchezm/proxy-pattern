import type { ActionHandler, ActionContext } from '../ActionHandler';
import { DriverFactory } from '@core/drivers/DriverFactory';
import assert from 'node:assert/strict';

export class AssertCountGreaterThan implements ActionHandler {
  name = 'assertCountGreaterThan';

  async execute(ctx: ActionContext) {
    const threshold = Number(ctx.args?.[0] ?? 0);
    const page = DriverFactory.getPage();

    const count = await page.locator(ctx.selector).count();
    assert.ok(
      count > threshold,
      `Expected count > ${threshold} for selector "${ctx.selector}", found ${count}`
    );
  }
}
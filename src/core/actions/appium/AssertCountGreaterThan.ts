import type { ActionHandler, ActionContext } from '../ActionHandler';
import assert from 'node:assert/strict';
import { SmartWait } from './SmartWait';

export class AssertCountGreaterThan implements ActionHandler {
  name = 'assertCountGreaterThan';

  async execute(ctx: ActionContext) {
    const threshold = Number(ctx.args?.[0] ?? 0);
    const timeoutMs = Number(ctx.args?.[1] ?? 5000);

    // SmartWait.elements throws if none appear within timeout
    const els = await SmartWait.elements(ctx.selector, timeoutMs);

    const count = await els.length;

    assert.ok(
      count > threshold,
      `Expected count > ${threshold} for selector "${ctx.selector}", found ${count}`
    );
  }
}
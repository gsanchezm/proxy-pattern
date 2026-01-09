import type { ActionHandler, ActionContext } from '../ActionHandler';
import { env } from '@core/config/env';
import { SmartWait } from './SmartWait';
import { DriverFactory } from '@core/drivers/DriverFactory';

type MatchMode = 'equals' | 'includes';

type Options = {
  match?: MatchMode;
  timeoutMs?: number;
  allowEmpty?: boolean;   // ✅ NEW
};

export class FindIndexByText implements ActionHandler {
  name = 'findIndexByText';

  async execute(ctx: ActionContext) {
    const target = ctx.args?.[0];
    const opts = (ctx.args?.[1] ?? {}) as Options;

    const targets = Array.isArray(target) ? target.map(String) : [String(target ?? '')];
    const match = opts.match ?? 'equals';
    const timeoutMs = Number(opts.timeoutMs ?? 5000);
    const allowEmpty = Boolean(opts.allowEmpty ?? false);

    if (!targets[0] || targets[0].trim() === '') {
      throw new Error('findIndexByText requires args[0] = string or string[]');
    }

    // ✅ if allowEmpty, do NOT call SmartWait.elements (which throws on empty)
    const list = allowEmpty
      ? await DriverFactory.getMobileDriver().$$(ctx.selector)
      : await SmartWait.elements(ctx.selector, timeoutMs);

    // if empty => not found
    if (!list || await list.length === 0) return -1;

    for (let i = 0; i < await list.length; i++) {
      const el = list[i];

      const text = String((await el.getText()) ?? '').trim();
      let candidate = text;

      if (env.platform === 'ios') {
        const name = String((await el.getAttribute('name')) ?? '').trim();
        const label = String((await el.getAttribute('label')) ?? '').trim();
        const value = String((await el.getAttribute('value')) ?? '').trim();
        candidate = (text || name || label || value).trim();
      } else {
        const contentDesc = String((await el.getAttribute('content-desc')) ?? '').trim();
        const name = String((await el.getAttribute('name')) ?? '').trim();
        candidate = (text || name || contentDesc).trim();
      }

      for (const t of targets) {
        const needle = t.trim();
        if (!needle) continue;

        if (match === 'equals' && candidate === needle) return i;
        if (match === 'includes' && candidate.includes(needle)) return i;
      }
    }

    return -1;
  }
}
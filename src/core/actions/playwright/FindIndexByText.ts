import type { ActionHandler, ActionContext } from '../ActionHandler';
import { DriverFactory } from '@core/drivers/DriverFactory';

type MatchMode = 'equals' | 'includes';

type Options = {
  match?: MatchMode;
};

export class FindIndexByText implements ActionHandler {
  name = 'findIndexByText';

  async execute(ctx: ActionContext) {
    const page = DriverFactory.getPage();

    const target = ctx.args?.[0];
    const opts = (ctx.args?.[1] ?? {}) as Options;

    const targets = Array.isArray(target) ? target.map(String) : [String(target ?? '')];
    const match: MatchMode = opts.match ?? 'equals';

    if (!targets[0] || targets[0].trim() === '') {
      throw new Error('findIndexByText requires args[0] = string or string[]');
    }

    const list = page.locator(ctx.selector);
    const count = await list.count();

    for (let i = 0; i < count; i++) {
      const text = (await list.nth(i).innerText()).trim();

      for (const t of targets) {
        const needle = t.trim();
        if (!needle) continue;

        if (match === 'equals' && text === needle) return i;
        if (match === 'includes' && text.includes(needle)) return i;
      }
    }

    return -1;
  }
}
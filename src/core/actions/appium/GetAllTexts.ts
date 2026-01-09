import type { ActionHandler, ActionContext } from '../ActionHandler';
import { env } from '@core/config/env';
import { SmartWait } from './SmartWait';

export class GetAllTexts implements ActionHandler {
  name = 'getAllTexts';

  async execute(ctx: ActionContext) {
    const list = await SmartWait.elements(ctx.selector, 5000);

    const out: string[] = [];
    for (const el of list) {
      const text = String((await el.getText()) ?? '').trim();
      if (text) { out.push(text); continue; }

      // iOS fallback attrs
      if (env.platform === 'ios') {
        const name = String((await el.getAttribute('name')) ?? '').trim();
        const label = String((await el.getAttribute('label')) ?? '').trim();
        const value = String((await el.getAttribute('value')) ?? '').trim();
        const candidate = (name || label || value).trim();
        if (candidate) out.push(candidate);
      } else {
        // Android fallback attrs
        const contentDesc = String((await el.getAttribute('content-desc')) ?? '').trim();
        if (contentDesc) out.push(contentDesc);
      }
    }
    return out;
  }
}
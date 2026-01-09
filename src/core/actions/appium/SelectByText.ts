import type { ActionHandler, ActionContext } from '../ActionHandler';
import { env } from '@core/config/env';
import { SmartWait } from './SmartWait';

export class SelectByText implements ActionHandler {
  name = 'selectByText';

  // Strategy map for platform-specific attributes
  private readonly platformAttributes: Record<string, string[]> = {
    ios: ['name', 'label', 'value'],
    android: ['name', 'content-desc'],
  };

  async execute(ctx: ActionContext) {
    const expectedRaw = String(ctx.args?.[0] ?? '').trim();
    
    // Guard Clause: Validation
    if (!expectedRaw) {
      throw new Error('selectByText requires a text value as first argument');
    }

    const expected = expectedRaw.toLowerCase();
    const list = await SmartWait.elements(ctx.selector, 5000);
    const seen: string[] = [];

    for (const el of list) {
      const candidate = await this.resolveCandidateText(el);
      
      // Guard Clause: Skip empty candidates
      if (!candidate) continue;

      seen.push(candidate);

      // Guard Clause: Success path
      if (candidate.toLowerCase() === expected) {
        await el.click();
        return;
      }
    }

    throw new Error(
      `selectByText: item "${expectedRaw}" not found for selector: ${ctx.selector}. Seen: ${seen.slice(0, 15).join(' | ')}`
    );
  }

  /**
   * Helper to extract the best possible text match based on platform
   */
  private async resolveCandidateText(el: any): Promise<string> {
    const baseText = String((await el.getText()) ?? '').trim();
    
    // Get attributes based on current platform (defaults to empty array if platform unknown)
    const attributes = this.platformAttributes[env.platform] ?? [];
    
    let extraText = '';
    for (const attr of attributes) {
      const val = String((await el.getAttribute(attr)) ?? '').trim();
      if (val) {
        extraText = val;
        break; // Return the first non-empty attribute found
      }
    }

    return baseText || extraText;
  }
}
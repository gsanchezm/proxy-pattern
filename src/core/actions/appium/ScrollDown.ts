import type { ActionHandler, ActionContext } from '../ActionHandler';
import { DriverFactory } from '@core/drivers/DriverFactory';

export class ScrollDown implements ActionHandler {
  name = 'scrollDown';

  async execute(ctx: ActionContext) {
    const driver = DriverFactory.getMobileDriver();
    const times = Math.max(1, Number(ctx.args?.[0] ?? 1));

    for (let i = 0; i < times; i++) {
      // Scroll inside first scrollable container on screen
      await driver.$(
        'android=new UiScrollable(new UiSelector().scrollable(true)).scrollForward()'
      );
    }
  }
}
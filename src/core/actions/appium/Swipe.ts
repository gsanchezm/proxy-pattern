import type { ActionHandler, ActionContext } from '../ActionHandler';
import { DriverFactory } from '@core/drivers/DriverFactory';
import { SmartWait } from './SmartWait';
import { env } from '@core/config/env';

type Direction = 'up' | 'down' | 'left' | 'right';

type SwipeOptions = {
  percent?: number;
  times?: number;
  timeoutMs?: number;
};

export class Swipe implements ActionHandler {
  name = 'swipe';

  async execute(ctx: ActionContext) {
    const driver = DriverFactory.getMobileDriver();

    const direction = String(ctx.args?.[0] ?? 'down') as Direction;
    const opts = (ctx.args?.[1] ?? {}) as SwipeOptions;

    const percent = Math.max(0.1, Math.min(0.95, Number(opts.percent ?? 0.7)));
    const times = Math.max(1, Number(opts.times ?? 1));
    const timeoutMs = Number(opts.timeoutMs ?? 10_000);

    const el = await SmartWait.element(ctx.selector, timeoutMs);
    const elementId = (el as any).elementId;

    for (let i = 0; i < times; i++) {
      // ✅ iOS: use mobile: scroll (supported by XCUITest)
      if (env.platform === 'ios') {
        try {
          await driver.execute('mobile: scroll', { elementId, direction });
          continue;
        } catch {
          // fallback to W3C below
        }
      }

      // ✅ W3C fallback (works on both)
      const loc = await el.getLocation();
      const size = await el.getSize();

      // ✅ Android: use swipeGesture/scrollGesture
      if (env.platform === 'android') {
        try {
          await driver.execute('mobile: scrollGesture', {
            left: loc.x,
            top: loc.y,
            width: size.width,
            height: size.height,
            direction,
            percent
          });
          continue;
        } catch {
          // fallback to W3C below
        }

        try {
          await driver.execute('mobile: swipeGesture', {
            left: loc.x,
            top: loc.y,
            width: size.width,
            height: size.height,
            direction,
            percent: Math.max(percent, 0.85)
          });
          continue;
        } catch {
          // fallback below
        }
      }

      const x = loc.x;
      const y = loc.y;
      const width = size.width;
      const height = size.height;

      const centerX = x + width / 2;
      const centerY = y + height / 2;

      const deltaX =
        direction === 'left' ? -width * percent :
        direction === 'right' ? width * percent : 0;

      const deltaY =
        direction === 'up' ? -height * percent :
        direction === 'down' ? height * percent : 0;

        // invert finger movement for vertical/horizontal scrolling
        const fingerDeltaX = -deltaX;
        const fingerDeltaY = -deltaY;

      const startX = Math.round(centerX);
      const startY = Math.round(centerY);
      const endX = Math.round(centerX + deltaX);
      const endY = Math.round(centerY + deltaY);

      await driver.performActions([
        {
          type: 'pointer',
          id: 'finger1',
          parameters: { pointerType: 'touch' },
          actions: [
            { type: 'pointerMove', duration: 0, x: startX, y: startY },
            { type: 'pointerDown', button: 0 },
            { type: 'pause', duration: 100 },
            { type: 'pointerMove', duration: 350, x: endX, y: endY },
            { type: 'pointerUp', button: 0 }
          ]
        }
      ]);
      await driver.releaseActions();
    }
  }
}
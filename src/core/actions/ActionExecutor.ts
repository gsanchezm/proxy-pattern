import { env } from '@core/config/env';
import { ActionRegistry } from './ActionRegistry';
import { logger } from '@core/telemetry/logger';

// Playwright handlers
import { Click as PwClick } from './playwright/Click';
import { Type as PwType } from './playwright/Type';
import { Press as PwPress } from './playwright/Press';
import { GetText as PwGetText } from './playwright/GetText';
import { SelectByText as PwSelectByText } from './playwright/SelectByText';
import { WaitVisible as PwWaitVisible } from './playwright/WaitVisible';
import { AssertVisible as PwAssertVisible } from './playwright/AssertVisible';
import { AssertCountGreaterThan as PwAssertCountGreaterThan } from './playwright/AssertCountGreaterThan';
import { ClickAll as PwClickAll } from './playwright/ClickAll';
import { GetAllTexts as PwGetAllTexts } from './playwright/GetAllTexts';
import { Count as PwCount } from './playwright/Count';
import { FindIndexByText as PwFindIndexByText } from './playwright/FindIndexByText';
import { ClickNth as PwClickNth } from './playwright/ClickNth';

// Appium handlers
import { Tap as MbTap } from './appium/Tap';
import { Type as MbType } from './appium/Type';
import { GetText as MbGetText } from './appium/GetText';
import { WaitVisible as MbWaitVisible } from './appium/WaitVisible';
import { AssertVisible as MbAssertVisible } from './appium/AssertVisible';
import { SelectByText as MbSelectByText } from './appium/SelectByText';
import { HideKeyboard as MbHideKeyboard } from './appium/HideKeyboard';
import { AssertCountGreaterThan as MbAssertCountGreaterThan } from './appium/AssertCountGreaterThan';
import { ClickAll as MbClickAll } from './appium/ClickAll';
import { GetAllTexts as MbGetAllTexts } from './appium/GetAllTexts';
import { Count as MbCount } from './appium/Count';
import { FindIndexByText as MbFindIndexByText } from './appium/FindIndexByText';
import { ClickNth as MbClickNth } from './appium/ClickNth';
import { Swipe as MbSwipe } from './appium/Swipe';
import { ScrollDown as MbScrollDown } from './appium/ScrollDown';

const registries = new Map<string, ActionRegistry>();

export class ActionExecutor {
  static getRegistry(): ActionRegistry {
    // Guard clause: missing driver
    if (!env.driver) {
      throw new Error('env.driver is not defined. Set DRIVER=playwright|appium');
    }

    const key = env.driver; // 'playwright' | 'appium'

    // Fast return: already built
    const existing = registries.get(key);
    if (existing) return existing;

    logger.info({ eventType: 'ACTION_REGISTRY_INIT', driver: env.driver });

    const registry = new ActionRegistry();

    if (env.driver === 'playwright') {
      registry.register(new PwClick());
      registry.register(new PwType());
      registry.register(new PwPress());
      registry.register(new PwGetText());
      registry.register(new PwSelectByText());
      registry.register(new PwWaitVisible());
      registry.register(new PwAssertVisible());
      registry.register(new PwAssertCountGreaterThan());
      registry.register(new PwClickAll());
      registry.register(new PwGetAllTexts());
      registry.register(new PwCount());
      registry.register(new PwFindIndexByText());
      registry.register(new PwClickNth());

      registries.set(key, registry);
      return registry;
    }

    if (env.driver === 'appium') {
      registry.register(new MbTap());
      registry.register(new MbType());
      registry.register(new MbGetText());
      registry.register(new MbWaitVisible());
      registry.register(new MbAssertVisible());
      registry.register(new MbSelectByText());
      registry.register(new MbHideKeyboard());
      registry.register(new MbAssertCountGreaterThan());
      registry.register(new MbClickAll());
      registry.register(new MbGetAllTexts());
      registry.register(new MbCount());
      registry.register(new MbFindIndexByText());
      registry.register(new MbClickNth());
      registry.register(new MbSwipe());
      registry.register(new MbScrollDown())

      registries.set(key, registry);
      return registry;
    }

    throw new Error(`Unsupported driver: ${env.driver}`);
  }
}
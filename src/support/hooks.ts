import { BeforeAll, AfterAll, Before, AfterStep, setDefaultTimeout } from '@cucumber/cucumber';
import { DriverFactory } from '@core/drivers/DriverFactory';
import { logger } from '@core/telemetry/logger';
import crypto from 'crypto';
import { env } from '@core/config/env';

// Increase default timeout for hooks/steps (Playwright init can exceed 5s)
setDefaultTimeout(180 * 1000);

const runId = crypto.randomUUID();

BeforeAll(async () => {
  const start = Date.now();

  logger.info({
    runId,
    architecture: 'proxy',
    platform: process.env.PLATFORM,
    viewport: process.env.VIEWPORT,
    driver: process.env.DRIVER,
    eventType: 'RUN_START'
  });

  logger.info({ runId, eventType: 'BEFOREALL_INIT_START' });
  await DriverFactory.init();
  logger.info({ runId, eventType: 'BEFOREALL_INIT_DONE' });

  logger.info({
    runId,
    architecture: 'proxy',
    platform: process.env.PLATFORM,
    viewport: process.env.VIEWPORT,
    driver: process.env.DRIVER,
    eventType: 'RUN_DRIVER_READY',
    durationMs: Date.now() - start
  });
});

/**
 * Scenario isolation:
 * Reset the application to a known state before each scenario.
 * - Web: go back to BASE_URL (login page)
 * - Mobile: terminate/activate app if identifiers exist
 */
Before(async function (scenario) {
  // feature can be undefined depending on how cucumber constructs the parameter
  const featureName =
    scenario.gherkinDocument?.feature?.name ??
    scenario.pickle?.uri ??
    'unknown-feature';

  this.feature = featureName;
  this.scenario = scenario.pickle?.name ?? 'unknown-scenario';

  // Reset state (prevents scenario bleed: e.g., scenario 1 leaves you on /inventory)
  if (env.driver === 'playwright') {
    const page = DriverFactory.getPage();
    await page.goto(env.baseUrl, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    return;
  }

  if (env.driver === 'appium') {
    const driver = DriverFactory.getMobileDriver();

    // Optional: you must define these in .env for mobile resets
    const bundleId = process.env.APP_BUNDLE_ID;   // iOS
    const appPackage = process.env.APP_PACKAGE;   // Android

    const appId =
      env.platform === 'ios'
        ? process.env.BUNDLE_ID || bundleId
        : appPackage;

    if (appId) {
      try {
        await driver.terminateApp(appId);
        await driver.activateApp(appId);
        return;
      } catch (e) {
        // fallback if bundle/package is wrong/not installed
      }
    }
    return;
  }
});

AfterAll(async () => {
  await DriverFactory.close();

  logger.info({
    runId,
    architecture: 'proxy',
    platform: process.env.PLATFORM,
    viewport: process.env.VIEWPORT,
    driver: process.env.DRIVER,
    eventType: 'RUN_END'
  });
});

AfterStep(function ({ pickleStep, result }) {
  const durationMs =
    result?.duration
      ? (result.duration.seconds ?? 0) * 1000 + (result.duration.nanos ?? 0) / 1_000_000
      : undefined;

  logger.info({
    runId,
    architecture: 'proxy',
    platform: this.platform ?? process.env.PLATFORM,
    viewport: this.viewport ?? process.env.VIEWPORT,
    driver: this.driver ?? process.env.DRIVER,

    feature: this.feature ?? 'unknown-feature',
    scenario: this.scenario ?? 'unknown-scenario',
    step: pickleStep.text,

    eventType: 'STEP_END',
    result: result?.status,
    durationMs
  });
});
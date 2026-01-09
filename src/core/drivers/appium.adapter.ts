import path from 'node:path';
import { remote } from 'webdriverio';
import { env } from '@core/config/env';
import { CapabilityProfileLoader } from './capabilities/CapabilityProfileLoader';

/**
 * WDIO log level values are stable, but typings vary across WDIO versions.
 * We define our own union to avoid type churn.
 */
type WdioLogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'silent';

export class AppiumAdapter {
  private static driver: WebdriverIO.Browser;

  /**
   * Resolve app path using:
   * 1) ANDROID_APP_PATH / IOS_APP_PATH (preferred)
   * 2) MOBILE_APP_PATH (fallback)
   *
   * Supports repo-relative paths (resolved using process.cwd()).
   */
  private static resolveAppPath(): string {
    const isAndroid = env.platform === 'android';

    const candidate =
      (isAndroid ? process.env.ANDROID_APP_PATH : process.env.IOS_APP_PATH) ??
      process.env.MOBILE_APP_PATH;

    if (!candidate) {
      throw new Error(
        `App path not configured. Set ${isAndroid ? 'ANDROID_APP_PATH' : 'IOS_APP_PATH'} (preferred) or MOBILE_APP_PATH.`
      );
    }

    return path.isAbsolute(candidate) ? candidate : path.resolve(process.cwd(), candidate);
  }

  private static parseBool(value?: string): boolean | undefined {
    if (value === undefined) return undefined;
    return value.toLowerCase() === 'true';
  }

  /**
   * Validate/normalize WDIO log level from env.
   * Falls back to 'error' if invalid.
   */
  private static resolveWdioLogLevel(): WdioLogLevel {
    const raw = (process.env.WDIO_LOG_LEVEL ?? 'error').toLowerCase();
    const allowed: WdioLogLevel[] = ['trace', 'debug', 'info', 'warn', 'error', 'silent'];

    return allowed.includes(raw as WdioLogLevel) ? (raw as WdioLogLevel) : 'error';
  }

  /**
   * Apply optional env overrides on top of JSON caps.
   * JSON is the primary source of truth. Env overrides are last-wins.
   */
  private static applyEnvOverrides(base: Record<string, any>, isAndroid: boolean) {
    const out = { ...base };

    // Common overrides
    if (process.env.UDID) out['appium:udid'] = process.env.UDID;
    if (process.env.DEVICE_NAME) out['appium:deviceName'] = process.env.DEVICE_NAME;
    if (process.env.PLATFORM_VERSION) out['appium:platformVersion'] = process.env.PLATFORM_VERSION;

    const noReset = this.parseBool(process.env.NO_RESET);
    if (noReset !== undefined) out['appium:noReset'] = noReset;

    const fullReset = this.parseBool(process.env.FULL_RESET);
    if (fullReset !== undefined) out['appium:fullReset'] = fullReset;

    if (process.env.ORIENTATION) out['appium:orientation'] = process.env.ORIENTATION;
    if (process.env.LANGUAGE) out['appium:language'] = process.env.LANGUAGE;
    if (process.env.LOCALE) out['appium:locale'] = process.env.LOCALE;

    const autoAcceptAlerts = this.parseBool(process.env.AUTO_ACCEPT_ALERTS);
    if (autoAcceptAlerts !== undefined) out['appium:autoAcceptAlerts'] = autoAcceptAlerts;

    // Android-only overrides
    if (isAndroid) {
      if (process.env.APP_PACKAGE) out['appium:appPackage'] = process.env.APP_PACKAGE;
      if (process.env.APP_ACTIVITY) out['appium:appActivity'] = process.env.APP_ACTIVITY;
      if (process.env.APP_WAIT_ACTIVITY) out['appium:appWaitActivity'] = process.env.APP_WAIT_ACTIVITY;
      if (process.env.APP_WAIT_PACKAGE) out['appium:appWaitPackage'] = process.env.APP_WAIT_PACKAGE;

      const autoGrantPermissions = this.parseBool(process.env.AUTO_GRANT_PERMISSIONS);
      if (autoGrantPermissions !== undefined) out['appium:autoGrantPermissions'] = autoGrantPermissions;
    } else {
      // iOS-only overrides
      if (process.env.BUNDLE_ID) out['appium:bundleId'] = process.env.BUNDLE_ID;

      const useNewWda = this.parseBool(process.env.USE_NEW_WDA);
      if (useNewWda !== undefined) out['appium:useNewWDA'] = useNewWda;

      if (process.env.UPDATED_WDA_BUNDLE_ID) out['appium:updatedWDABundleId'] = process.env.UPDATED_WDA_BUNDLE_ID;
      if (process.env.XCODE_ORG_ID) out['appium:xcodeOrgId'] = process.env.XCODE_ORG_ID;
      if (process.env.XCODE_SIGNING_ID) out['appium:xcodeSigningId'] = process.env.XCODE_SIGNING_ID;
    }

    // Advanced raw caps override (last-wins)
    if (process.env.APPIUM_CAPS_JSON) {
      try {
        const raw = JSON.parse(process.env.APPIUM_CAPS_JSON) as Record<string, any>;
        Object.assign(out, raw);
      } catch (e) {
        throw new Error(`Invalid JSON in APPIUM_CAPS_JSON: ${(e as Error).message}`);
      }
    }

    return out;
  }

  /**
   * Build capabilities using:
   * 1) JSON profile (capabilities/<platform>/<profile>.json)
   * 2) inject app path if missing/empty
   * 3) env overrides (last-wins)
   */
  private static buildCapabilities(): Record<string, any> {
    // Guard clause: ensure platform is mobile
    if (env.platform !== 'android' && env.platform !== 'ios') {
      throw new Error(`PLATFORM must be android|ios for Appium. Got: ${env.platform}`);
    }

    const isAndroid = env.platform === 'android';

    // Profile selection
    const profileName =
      process.env.CAP_PROFILE ?? (isAndroid ? 'galaxy_s24_ultra' : 'iphone_16_pro');
    const capName = process.env.CAP_NAME; // optional: pick entry by "name" inside file

    const profile = CapabilityProfileLoader.load(env.platform, profileName);
    let caps = CapabilityProfileLoader.selectCaps(profile, capName);

    // Inject/resolve app path
    const appPath = this.resolveAppPath();
    if (!caps['appium:app'] || String(caps['appium:app']).trim() === '') {
      caps = { ...caps, 'appium:app': appPath };
    } else {
      const rawApp = String(caps['appium:app']);
      caps = {
        ...caps,
        'appium:app': path.isAbsolute(rawApp) ? rawApp : path.resolve(process.cwd(), rawApp)
      };
    }

    // Apply env overrides last
    caps = this.applyEnvOverrides(caps, isAndroid);

    return caps;
  }

  static async init() {
    const hostname = process.env.APPIUM_HOST ?? 'localhost';
    const port = Number(process.env.APPIUM_PORT ?? '4723');
    const hubPath = process.env.APPIUM_PATH ?? '/';

    const capabilities = this.buildCapabilities();

    this.driver = await remote({
      hostname,
      port,
      path: hubPath,
      logLevel: this.resolveWdioLogLevel(),
      capabilities
    });
  }

  static getDriver(): WebdriverIO.Browser {
    if (!this.driver) throw new Error('Appium driver not initialized.');
    return this.driver;
  }

  static async close() {
    if (!this.driver) return;
    await this.driver.deleteSession();
  }
}
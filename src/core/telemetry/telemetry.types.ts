export interface TelemetryEvent {
    runId: string;
    timestamp: string;
    architecture: 'proxy';
    platform: 'web' | 'android' | 'ios';
    viewport?: 'desktop' | 'responsive';
    driver: 'playwright' | 'appium';
    feature: string;
    scenario: string;
    step: string;
    eventType: string;
    durationMs?: number;
    action?: {
      name: string;
      target?: string;
    };
    locator?: {
      key: string;
      resolvedFor: string;
    };
    result?: 'pass' | 'fail';
    error?: {
      name: string;
      message: string;
      stack?: string;
    };
  }  
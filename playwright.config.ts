import { defineConfig } from '@playwright/test';

export default defineConfig({
  use: {
    headless: false,
    connectOptions: {
      wsEndpoint: `wss://ondemand.${process.env.SAUCE_REGION}.saucelabs.com/playwright?capabilities=${encodeURIComponent(
        JSON.stringify({
          browserName: 'chromium',
          browserVersion: 'latest',
          platformName: 'Windows 11',
          'sauce:options': {
            name: 'Playwright Cucumber Test',
            build: process.env.GITHUB_RUN_ID
          }
        })
      )}`
    }
  }  
});
import 'dotenv/config';

export const env = {
  platform: process.env.PLATFORM as 'web' | 'android' | 'ios',
  viewport: process.env.VIEWPORT as 'desktop' | 'responsive' | undefined,
  driver: process.env.DRIVER as 'playwright' | 'appium',
  baseUrl: process.env.BASE_URL as string
};
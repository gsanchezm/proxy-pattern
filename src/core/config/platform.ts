import { env } from './env';

export const resolvePlatformKey = () => {
  if (env.platform === 'web') {
    return `web.${env.viewport}`;
  }
  return env.platform;
};
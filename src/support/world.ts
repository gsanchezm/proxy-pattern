import { setWorldConstructor, World } from '@cucumber/cucumber';
import { env } from '@core/config/env';

class CustomWorld extends World {
  platform = env.platform;
  viewport = env.viewport;
  driver = env.driver;

  feature?: string;
  scenario?: string;
}

setWorldConstructor(CustomWorld);
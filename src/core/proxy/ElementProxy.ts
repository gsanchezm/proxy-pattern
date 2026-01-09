import { LocatorResolver } from './LocatorResolver';
import { logger } from '@core/telemetry/logger';
import crypto from 'crypto';
import { env } from '@core/config/env';
import { ActionExecutor } from '@core/actions/ActionExecutor';
import { AliasResolver } from '@core/actions/AliasResolver';

const runId = crypto.randomUUID();

export const ElementProxy = (featureFolder: string, locatorFile: string, locatorKey: string) =>
  new Proxy(
    {},
    {
      get(_, requestedAction: string) {
        return async (...args: unknown[]) => {
          const { selector, resolvedFor } = LocatorResolver.resolve(
            featureFolder,
            locatorFile,
            locatorKey
          );

          // Resolve alias (submit -> click/tap, enterText -> type, etc.)
          const resolvedAction = AliasResolver.resolve(requestedAction);

          logger.info({
            runId,
            architecture: 'proxy',
            platform: env.platform,
            viewport: env.viewport,
            driver: env.driver,
            locatorFile,
            scenario: 'runtime',
            step: requestedAction,
            eventType: 'LOCATOR_RESOLUTION',
            locator: { key: locatorKey, resolvedFor }
          });

          logger.info({
            runId,
            architecture: 'proxy',
            platform: env.platform,
            viewport: env.viewport,
            driver: env.driver,
            locatorFile,
            scenario: 'runtime',
            step: requestedAction,
            eventType: 'ACTION',
            action: {
              name: requestedAction,
              target: locatorKey,
              resolvedAs: resolvedAction
            }
          });

          const registry = ActionExecutor.getRegistry();
          logger.info({ eventType: 'ACTION_REGISTRY', driver: env.driver, action: resolvedAction });

          return registry.execute(resolvedAction, {
            selector,
            args,
            locatorFile,
            locatorKey,
            action: resolvedAction
          });
        };
      }
    }
  );
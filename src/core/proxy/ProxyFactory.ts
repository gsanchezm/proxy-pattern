import { ElementProxy } from './ElementProxy';

export const createElement = (featureFolder: string, locatorFile: string, key: string) =>
  ElementProxy(featureFolder, locatorFile, key);
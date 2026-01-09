import { createElement } from '@core/proxy/ProxyFactory';

const featureFolder = 'shared';
const locatorFile = 'menu-options';

// Define keys in one place
const keys = [
  'logoAndNameImage',
  'cartIcon',
  'cartBadge'
] as const;

// Map keys to elements
export const MenuOptionActions = keys.reduce((acc, key) => {
  acc[key] = createElement(featureFolder, locatorFile, key);
  return acc;
}, {} as Record<typeof keys[number], any>);
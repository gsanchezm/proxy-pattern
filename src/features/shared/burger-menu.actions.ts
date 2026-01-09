import { createElement } from '@core/proxy/ProxyFactory';

const featureFolder = 'shared';
const locatorFile = 'burger-menu';

// Define keys in one place
const keys = [
  'burgerMenuButton',
  'menuItemList',
  'loginMenuItemButton',
  'logoutMenuItemButton'
] as const;

// Map keys to elements
export const BurgerMenuActions = keys.reduce((acc, key) => {
  acc[key] = createElement(featureFolder, locatorFile, key);
  return acc;
}, {} as Record<typeof keys[number], any>);
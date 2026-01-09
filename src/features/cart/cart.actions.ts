import { createElement } from '@core/proxy/ProxyFactory';

const featureFolder = 'cart';
const locatorFile = 'cart';

// Define keys in one place
const keys = [
  'cartItemList',
  'cartItemNameList'
] as const;

// Map keys to elements
export const CartActions = keys.reduce((acc, key) => {
  acc[key] = createElement(featureFolder, locatorFile, key);
  return acc;
}, {} as Record<typeof keys[number], any>);
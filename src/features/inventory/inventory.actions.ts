import { createElement } from '@core/proxy/ProxyFactory';

const featureFolder = 'inventory';
const locatorFile = 'inventory';

// Define keys in one place
const keys = [
  'catalogCollection',
  'productTitle',
  'productCardList',
  'itemName',
  'addToCartButton',
  'removeButton',
  'productImage'
] as const;

// Map keys to elements
export const InventoryActions = keys.reduce((acc, key) => {
  acc[key] = createElement(featureFolder, locatorFile, key);
  return acc;
}, {} as Record<typeof keys[number], any>);
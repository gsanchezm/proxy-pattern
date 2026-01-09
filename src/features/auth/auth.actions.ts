import { createElement } from '@core/proxy/ProxyFactory';

const featureFolder = 'auth';
const locatorFile = 'auth-sign-in';

// Define keys in one place
const keys = [
  'userNameInput',
  'passwordInput',
  'loginButton',
  'errorLabel',
  'lockedUserErrorLabel',
  'okButton',
] as const;

// Map keys to elements
export const AuthActions = keys.reduce((acc, key) => {
  acc[key] = createElement(featureFolder, locatorFile, key);
  return acc;
}, {} as Record<typeof keys[number], any>);
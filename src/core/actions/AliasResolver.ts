import { env } from '@core/config/env';

type Driver = 'playwright' | 'appium';

// Per-driver alias maps
const aliasMap: Record<Driver, Record<string, string>> = {
  playwright: {
    submit: 'click',
    press: 'press',
    enterText: 'type',
    assertText: 'getText',
    readText: 'getText',
    clickByText: 'selectByText',
    choose: 'selectByText',
    selectByText: 'selectByText',
    waitForVisible: 'waitVisible',
    verifyVisible: 'assertVisible',
    assertHasItems: 'assertCountGreaterThan',
    assertCountGreaterThan: 'assertCountGreaterThan',
    clickAll: 'clickAll',
    count: 'count',
    lenght: 'count',
    getAllTexts: 'getAllTexts',
    getTexts: 'getAllTexts',
    findIndexByText: 'findIndexByText',
    clickNth: 'clickNth',
    clickChild: 'clickNth'

  },
  appium: {
    submit: 'tap',
    press: 'tap',
    enterText: 'type',
    assertText: 'getText',
    readText: 'getText',
    clickByText: 'selectByText',
    choose: 'selectByText',
    selectByText: 'selectByText',
    waitForVisible: 'waitVisible',
    verifyVisible: 'assertVisible',
    hideKeyboard: 'hideKeyboard',
    dismissKeyboard: 'hideKeyboard',
    assertHasItems: 'assertCountGreaterThan',
    assertCountGreaterThan: 'assertCountGreaterThan',
    clickAll: 'clickAll',
    count: 'count',
    lenght: 'count',
    getAllTexts: 'getAllTexts',
    getTexts: 'getAllTexts',
    findIndexByText: 'findIndexByText',
    clickNth: 'clickNth',
    clickChild: 'clickNth',
    swipe: 'swipe',
    scrolldown: 'scrollDown'

  }
};

export class AliasResolver {
  static resolve(action: string): string {
    const driver = env.driver;

    // Guard clause: unknown driver
    if (driver !== 'playwright' && driver !== 'appium') return action;

    // Fast return: no alias
    const resolved = aliasMap[driver][action];
    return resolved ?? action;
  }
}
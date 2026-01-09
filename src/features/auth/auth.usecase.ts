import assert from 'node:assert/strict';
import { AuthActions } from './auth.actions';
import { BurgerMenuActions } from '@features/shared/burger-menu.actions';
import { MenuOptionActions } from '@features/shared/menu-options.actions';
import { LogOutActions } from '@features/shared/log-out.actions';
import { TestDataFactory } from '@core/testdata/TestDataFactory';
import { env } from '@core/config/env';

export class AuthUseCase {

  private currentUserKey: string = '';

  private normalizeError(msg: string): string {
    return msg
      .trim()
      .replace(/^Epic sadface:\s*/i, '') // Remove SauceDemo prefix
      .replace(/[,.]/g, '')             // Remove commas and periods
      .replace(/\s+/g, ' ')             // Collapse multiple spaces/newlines into one
      .trim()
      .toLowerCase();                   // Optional: Case-insensitive comparison
  }

  private shouldSkipErrorAssertion(expectedMessage: string): boolean {
    // iOS app doesn't show this specific SauceDemo web error
    if (env.platform === 'ios' && /locked out/i.test(expectedMessage)) {
      return true;
    }
    return false;
  }

  private async ensureLoginScreen() {
    // Guard: Web is a no-op (handled by navigation)
    if (env.driver !== 'appium') return;

    // Already on Login Screen?
    try {
      await AuthActions.userNameInput.waitForVisible(1500);
      return;
    } catch {
      // Not on login screen → continue
    }

    // 1. Android Specific: If logged in, we must log out first
    if (env.platform === 'android') {
      try {
        await this.logout();
      } catch (error) {

      }
    }

    // 2. Open Menu (Common for Mobile)
    await BurgerMenuActions.burgerMenuButton.press();

    // 3. Navigate to Login using Platform Map
    const loginLabelMap: Record<string, string> = {
      ios: 'Login Button',
      android: 'Log In',
    };

    const label = loginLabelMap[env.platform] ?? 'Log In';
    await BurgerMenuActions.menuItemList.selectByText(label);

    // 4. Final Guard: Wait for transition
    await AuthActions.userNameInput.waitForVisible(10_000);
  }

  async login(userKey: string) {
    this.currentUserKey = userKey;
    await this.ensureLoginScreen();

    // Define the mapping strategy for aliases
    const userAliasMap: Record<string, Record<string, string>> = {
      valid_user: {
        playwright: 'standard_user',
        appium: 'bob',
      },
      locked_out_user: {
        playwright: 'locked_out_user',
        appium: 'alice',
      },
    };

    // Resolve the key: Check the map first, otherwise fall back to the provided userKey
    const platformKey = env.driver; // 'playwright' or 'appium'
    const resolvedUserKey = userAliasMap[userKey]?.[platformKey] ?? userKey;

    const user = TestDataFactory.user(resolvedUserKey);

    await AuthActions.userNameInput.enterText(user.username);
    await AuthActions.passwordInput.enterText(user.password);

    // Guard Clause for iOS specific behavior
    if (env.driver === 'appium' && env.platform === 'ios') {
      await AuthActions.userNameInput.tap();
    }

    await AuthActions.loginButton.submit();
  }

  async submitEmptyCredentials() {
    await this.ensureLoginScreen();

    if (env.platform === 'android') {
      await AuthActions.userNameInput.enterText('');
      await AuthActions.passwordInput.enterText('');
    }

    await AuthActions.loginButton.submit();
  }

  async expectLoggedIn() {
    // logged in = Sauce logo is visible
    await MenuOptionActions.logoAndNameImage.waitForVisible(10_000);
    await MenuOptionActions.logoAndNameImage.verifyVisible();
  }

  async expectReturnedToLogin() {
    await AuthActions.userNameInput.verifyVisible();
  }

  async logout() {
    // open burger menu
    await BurgerMenuActions.burgerMenuButton.press();

    // Map of platform-specific menu labels
    const menuLabels: Record<string, string> = {
      web: 'Logout',
      android: 'Log Out',
      ios: 'Login Button', // Added iOS for completeness
    };

    const label = menuLabels[env.platform] ?? 'Logout';
    await BurgerMenuActions.menuItemList.selectByText(label);

    if (env.platform === 'web') return;

    if (env.platform === 'android') await LogOutActions.logOutButton.press();
  }

  async expectError(expectedMessage: string) {
    if (this.shouldSkipErrorAssertion(expectedMessage)) return;

    // Use the stored state to pick the selector
    const errorSelector = this.getErrorSelector();

    const actualRaw = String(await errorSelector.getText());
    const actual = this.normalizeError(actualRaw);
    const expected = this.normalizeError(expectedMessage);

    assert.strictEqual(actual, expected, `Error mismatch! Raw actual: "${actualRaw}"`);

    await this.dismissIosAlertIfPresent();
  }

  /**
   * Refactored selector logic using state and Guard Clauses
   */
  private getErrorSelector() {
    const isAndroid = env.driver === 'appium' && env.platform === 'android';
    const isLockedUser = this.currentUserKey === 'locked_out_user';

    // 1. Determine the correct selector first
    const selector = (isAndroid && isLockedUser)
      ? AuthActions.lockedUserErrorLabel
      : AuthActions.errorLabel;

    // 2. Reset the state so it doesn't bleed into the next test/assertion
    this.currentUserKey = '';

    // 3. Return the chosen selector
    return selector;
  }

  private async dismissIosAlertIfPresent() {
    if (env.driver === 'appium' && env.platform === 'ios') {
      try { await AuthActions.okButton.tap(); } catch { /* ignore */ }
    }
  }
}
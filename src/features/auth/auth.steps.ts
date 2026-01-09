import { Given, When, Then } from '@cucumber/cucumber';
import { AuthUseCase } from './auth.usecase';

const auth = new AuthUseCase();

Given('the application is launched', async function () {
  // already launched in BeforeAll
});

When('SauceLab user submit credentials as {string}', async function (userKey: string) {
  if (userKey === 'empty') {
    await auth.submitEmptyCredentials();
    return;
  }
  await auth.login(userKey);
});

Then('{string} should happen with message {string}', async function (outcome: string, message: string) {
  if (outcome === 'access') {
    await auth.expectLoggedIn();
    return;
  }
  await auth.expectError(message);
});

When('he log out', async function () {
  await auth.logout();
});

Then('the system should return to the login page', async function () {
  await auth.expectReturnedToLogin();
});
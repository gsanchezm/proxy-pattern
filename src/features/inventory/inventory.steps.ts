import { Given, When, Then } from '@cucumber/cucumber';
import { InventoryUseCase } from './inventory.usecases';
import { CartUseCase } from '../cart/cart.usecases';

const inventory = new InventoryUseCase();
const cart = new CartUseCase();

Given('he is on the inventory page', async function () {
  await inventory.ensureOnInventoryPage();
});

Then('the user should see a list of available products', async function () {
  await inventory.expectProductListVisible();
});

When('the user adds the product {string} to the cart', async function (productKey: string) {
  await inventory.addProductToCart(productKey);
});

Then('the cart should reflect the item {string}', async function (productKey: string) {
  await cart.cartShouldReflectItemAndRemove(productKey);
});

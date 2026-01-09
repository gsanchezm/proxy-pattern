import assert from 'node:assert/strict';
import { env } from '@core/config/env'
import { TestDataFactory } from '@core/testdata/TestDataFactory';
import { InventoryActions } from '@features/inventory/inventory.actions';
import { MenuOptionActions } from '@features/shared/menu-options.actions';
import { CartActions } from '@features/cart/cart.actions';

export class InventoryUseCase {
    async ensureOnInventoryPage() {
        await InventoryActions.productTitle.verifyVisible();
    }

    async expectProductListVisible() {
        await InventoryActions.productCardList.assertHasItems();
    }

    async resetInventoryStateWeb() {
        if (env.driver !== 'playwright') return;
        try {
            await InventoryActions.removeButton.clickAll();
        } catch {
        }
    }

    async addProductToCart(productKey: string) {
        const titles = TestDataFactory.acceptableProductTitles(productKey);

        // Web branch stays as you already have (findIndexByText + clickNth on add button list)
        if (env.driver === 'playwright') {
            await this.resetInventoryStateWeb();

            const idx = await InventoryActions.itemName.findIndexByText(titles, { match: 'includes' });
            assert.ok(idx >= 0, `Product not found for key "${productKey}". Tried: ${titles.join(' | ')}`);

            await InventoryActions.addToCartButton.clickNth(idx);
            return;
        }

        // iOS Mobile branch: open card -> details -> add -> back
        if (env.driver === 'appium') {//&& env.platform === 'ios') {
            const maxSwipes = 8;
            let lastSnapshot = '';

            for (let i = 0; i < maxSwipes; i++) {
                const idx = await InventoryActions.itemName.findIndexByText(
                    titles,
                    { match: 'includes', timeoutMs: 2000 }
                );

                if (idx >= 0) {
                    // 1) Tap the product card (opens details screen)
                    await InventoryActions.productCardList.clickNth(idx, 6000);

                    // 2) Tap Add to cart on details screen
                    await InventoryActions.addToCartButton.tap();

                    // 3) Navigate back to catalog (so next outline row starts from grid)
                    /* try {
                      await InventoryActions.detailsBackButton.tap();
                    } catch {
                      // if no back button locator works, you can use a swipe-right gesture later
                    } */

                    return;
                }

                if (env.platform === 'android') {
                    // Snapshot visible titles to detect if swipe actually moved list
                    const visibleTitles = await InventoryActions.itemName.getAllTexts?.(); // if you created this
                    // If you don't have getAllTexts yet, we can add it (recommended).
                    const snapshot = Array.isArray(visibleTitles) ? visibleTitles.join('|') : '';

                    if (snapshot && snapshot === lastSnapshot) {
                        throw new Error(`Reached end of list (no scroll progress). Product not found: ${productKey}`);
                    }
                    lastSnapshot = snapshot;
                }

                if (env.platform === 'android') {
                    await InventoryActions.itemName.scrollDown(1);
                }
                
                if (env.platform === 'ios') {
                    // scroll down and retry
                    await InventoryActions.catalogCollection.swipe('down', { times: 1, percent: 0.8 });
                }
            }

            assert.fail(`Product not found after scrolling for key "${productKey}". Tried: ${titles.join(' | ')}`);
        }

        throw new Error('addProductToCart() not implemented for this platform yet.');
    }
}
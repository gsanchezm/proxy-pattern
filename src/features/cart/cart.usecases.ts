import assert from 'node:assert/strict';
import { env } from '@core/config/env';
import { TestDataFactory } from '@core/testdata/TestDataFactory';
import { CartActions } from '@features/cart/cart.actions';
import { MenuOptionActions } from '@features/shared/menu-options.actions';
import { InventoryActions } from '@features/inventory/inventory.actions';

export class CartUseCase {
    async cartShouldReflectItemAndRemove(productKey: string) {

        const titles = TestDataFactory.acceptableProductTitles(productKey);

        // Open cart
        await MenuOptionActions.cartIcon.submit();

        // Find the item in the cart by title
        const idx = await CartActions.cartItemNameList.findIndexByText(titles, { match: 'includes' });
        assert.ok(idx >= 0, `Cart does not contain product key "${productKey}". Tried: ${titles.join(' | ')}`);

        // Remove it using aligned remove button list
        if (env.driver === 'playwright'){
            await InventoryActions.removeButton.clickNth(idx);
        }

        if (env.driver !== 'playwright'){
            await InventoryActions.removeButton.press();
        }

        // Verify it is gone
        const idx2 = await CartActions.cartItemNameList.findIndexByText(titles,{ match: 'includes', allowEmpty: true });
        assert.equal(idx2, -1, `Expected product removed, but still found in cart for key "${productKey}"`);
    }
}
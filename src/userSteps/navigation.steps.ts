import { test } from '@playwright/test';

import type { QuotePage } from '../pages/QuotePage';

/**
 * Scroll far enough down the quote for the sticky header to appear.
 *
 * The header's Pay button is not merely hidden at the top of the page — it is
 * absent from the DOM entirely — so it has to be brought into existence before
 * it can be read. Scrolling the activation button into view is the user-shaped
 * way to do that, and it puts both the foot of the page and the sticky header
 * on screen at once.
 */
export async function scrollToStickyHeader(quotePage: QuotePage): Promise<void> {
  return test.step('scroll down to reveal the sticky header', async () => {
    await quotePage.price.activation.root.scrollIntoViewIfNeeded();
    await quotePage.price.header.root.waitFor();
  });
}

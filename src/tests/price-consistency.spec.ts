import { epic, feature, parameter, severity, story } from 'allure-js-commons';

import type { AddonKey } from '../data/quote.data';
import { expect, test } from '../fixtures/quote.fixture';
import type { QuotePage } from '../pages/QuotePage';
import { addonChange, expectedTotal, type Total } from '../support/premium';

/**
 * Every other spec asserts the price from the hero Pay button alone, on the
 * assumption that the page's three price displays share a source. That is an
 * implementation assumption, to ensure the price stays consistent across the
 * page I decided to implement this spec.
 */
const ADDON: AddonKey = 'equipment_breakdown';

async function expectEveryDisplayToShow(quotePage: QuotePage, expected: Total): Promise<void> {
  await expect.soft
    .poll(() => quotePage.price.header.total(), {
      message: 'the sticky header should show the same total as the hero button',
    })
    .toEqual(expected);

  await expect.soft
    .poll(() => quotePage.price.activation.total(), {
      message: 'the activation button should show the same total as the hero button',
    })
    .toEqual(expected);
}

test.describe('Price display consistency', () => {
  test('every price display agrees after the quote is repriced', async ({ quotePage, steps }) => {
    await epic('Renters Quote');
    await feature('Price display');
    await story('The hero, sticky header and activation buttons never disagree');
    await severity('normal');
    await parameter('addon', ADDON);

    await quotePage.open();
    const baseline = await quotePage.price.total();

    await steps.enableAddon(ADDON);
    await expect
      .poll(() => quotePage.price.total(), { message: 'the hero button should reprice' })
      .toEqual(expectedTotal(baseline.amount, 'monthly', addonChange(ADDON)));

    // The sticky header is absent from the DOM until the page is scrolled.
    await steps.scrollToStickyHeader();
    await expectEveryDisplayToShow(quotePage, await quotePage.price.main.total());
  });

  test('every price display agrees when the quote is billed annually', async ({
    quotePage,
    steps,
  }) => {
    await epic('Renters Quote');
    await feature('Price display');
    await story('Switching to annual billing updates every price display');
    await severity('normal');
    await parameter('plan', 'annual');

    await quotePage.open();
    const monthly = await quotePage.price.total();

    await steps.selectPaymentPlan('annual');
    await expect
      .poll(() => quotePage.price.total(), { message: 'the hero button should bill annually' })
      .toEqual(expectedTotal(monthly.amount, 'annual'));

    await steps.scrollToStickyHeader();

    await expectEveryDisplayToShow(quotePage, await quotePage.price.main.total());
  });
});

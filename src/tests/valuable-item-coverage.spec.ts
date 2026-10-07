import { epic, feature, parameter, severity, story } from 'allure-js-commons';

import type { ValuableItemCategory } from '../data/quote.data';
import { expect, test } from '../fixtures/quote.fixture';
import { expectedTotal, valuableItemChange } from '../support/premium';

interface ValuableItemCase {
  readonly category: ValuableItemCategory;
  readonly value: number;
}

const CASES: readonly ValuableItemCase[] = [
  { category: 'jewelry', value: 1_000 },
  { category: 'bicycles', value: 3_000 },
];

const money = (amount: number): string => `$${amount.toLocaleString('en-US')}`;

test.describe('Extra coverage for valuable items', () => {
  CASES.forEach(({ category, value }) => {
    test(`covering ${category} at ${money(value)} charges the advertised premium and removing it refunds it`, async ({
      quotePage,
      steps,
    }) => {
      await epic('Renters Quote');
      await feature('Extra Coverage');
      await story('Adding and removing extra coverage reprices the quote');
      await severity('critical');
      await parameter('category', category);
      await parameter('declaredValue', money(value));

      await quotePage.open();
      const baseline = await quotePage.price.total();
      const tile = quotePage.valuableItem(category);
      const change = valuableItemChange(category, value);

      expect(await tile.isCovered(), `${category} should start with no extra coverage`).toBe(false);

      await steps.openValuableItemDialog(category);
      await steps.setValuableItemValue(value);

      const dialog = quotePage.valuableItemDialog;
      await expect
        .poll(() => dialog.declaredValue(), {
          message: 'the dialog should hold the requested value',
        })
        .toBe(value);

      await expect.soft
        .poll(() => dialog.advertisedPremium(), {
          message: `the dialog should quote ${change.delta}/mo for ${category} at ${money(value)}`,
        })
        .toBeCloseTo(change.delta, 2);

      await steps.confirmValuableItemAddition();

      await expect
        .poll(() => tile.isCovered(), { message: `${category} should now be covered` })
        .toBe(true);
      await expect.soft
        .poll(() => tile.declaredValue(), {
          message: 'the tile should show the declared value',
        })
        .toBe(value);
      await expect.soft
        .poll(() => tile.advertisedPremium(), {
          message: 'the tile should advertise the same premium the dialog quoted',
        })
        .toBeCloseTo(change.delta, 2);

      await expect.soft
        .poll(() => quotePage.price.total(), {
          message: `covering ${category} should charge exactly what it advertised`,
        })
        .toEqual(expectedTotal(baseline.amount, 'monthly', change));

      await steps.removeValuableItem(category);

      await expect.soft
        .poll(() => tile.isCovered(), { message: `${category} should be back to uncovered` })
        .toBe(false);
      await expect.soft
        .poll(() => quotePage.price.total(), {
          message: `removing ${category} should restore the original quote`,
        })
        .toEqual(baseline);
    });
  });
});

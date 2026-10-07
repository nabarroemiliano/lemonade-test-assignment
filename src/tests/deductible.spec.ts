import { epic, feature, parameter, severity, story } from 'allure-js-commons';

import { DEDUCTIBLE_LADDER } from '../data/pricing.data';
import type { DeductibleOption } from '../data/quote.data';
import { expect, test } from '../fixtures/quote.fixture';
import { deductibleChange, expectedTotal } from '../support/premium';

interface DeductibleCase {
  readonly option: DeductibleOption;
  readonly movement: 'lower' | 'higher';
  readonly expectedSign: 1 | -1;
}

const CASES: readonly DeductibleCase[] = [
  { option: 250, movement: 'lower', expectedSign: 1 },
  { option: 1000, movement: 'higher', expectedSign: -1 },
  { option: 2500, movement: 'higher', expectedSign: -1 },
];

const money = (amount: number): string => `$${amount.toLocaleString('en-US')}`;

test.describe('Deductible', () => {
  CASES.forEach(({ option, movement, expectedSign }) => {
    test(`a ${movement} deductible of ${money(option)} moves the premium the other way`, async ({
      quotePage,
      steps,
    }) => {
      await epic('Renters Quote');
      await feature('Deductible');
      await story('A lower deductible costs more and a higher one costs less');
      await severity('critical');
      await parameter('from', money(DEDUCTIBLE_LADDER.defaultOption));
      await parameter('to', money(option));

      await quotePage.open();
      const baseline = await quotePage.price.total();

      expect(await quotePage.deductible.selected(), 'the quote should load on its default').toBe(
        DEDUCTIBLE_LADDER.defaultOption,
      );

      await steps.selectDeductible(option);

      expect(await quotePage.deductible.selected(), 'the dropdown should show the choice').toBe(
        option,
      );

      await expect.soft
        .poll(() => quotePage.price.total(), {
          message: `a ${money(option)} deductible should reprice by the modelled delta`,
        })
        .toEqual(expectedTotal(baseline.amount, 'monthly', deductibleChange(option)));

      const repriced = await quotePage.price.total();
      expect
        .soft(
          Math.sign(repriced.amount - baseline.amount),
          `a ${movement} deductible should move the premium ${expectedSign === 1 ? 'up' : 'down'}`,
        )
        .toBe(expectedSign);
    });
  });
});

import { description, epic, feature, parameter, severity, story } from 'allure-js-commons';

import type { CoverageCategory } from '../data/quote.data';
import { expect, test } from '../fixtures/quote.fixture';
import { coverageChange, expectedTotal } from '../support/premium';

interface CoverageCase {
  readonly category: CoverageCategory;
  readonly from: number;
  readonly to: number;
  readonly direction: 'up' | 'down';
}

const CASES: readonly CoverageCase[] = [
  { category: 'Personal Liability', from: 100_000, to: 500_000, direction: 'up' },
  { category: 'Personal Property', from: 50_000, to: 30_000, direction: 'down' },
  { category: 'Loss of use', from: 15_000, to: 20_000, direction: 'up' },
];

const money = (amount: number): string => `$${amount.toLocaleString('en-US')}`;

test.describe('Coverage amounts', () => {
  CASES.forEach(({ category, from, to, direction }) => {
    test(`stepping ${category} ${direction} to ${money(to)} reprices the quote and stepping back restores it`, async ({
      quotePage,
      steps,
    }) => {
      await epic('Renters Quote');
      await feature('Coverage Amounts');
      await story('Changing a coverage amount reprices the quote');
      await severity('critical');
      await parameter('category', category);
      await parameter('from', money(from));
      await parameter('to', money(to));

      await quotePage.open();
      const baseline = await quotePage.price.total();
      const card = quotePage.coverage(category);

      expect(await card.amount(), `${category} should load at its default amount`).toBe(from);

      await steps.setCoverageAmount(category, to);
      expect(await card.amount(), `${category} should now read ${money(to)}`).toBe(to);

      await expect.soft
        .poll(() => quotePage.price.total(), {
          message: `${category} at ${money(to)} should reprice the quote by the modelled delta`,
        })
        .toEqual(expectedTotal(baseline.amount, 'monthly', coverageChange(category, to, from)));

      await steps.setCoverageAmount(category, from);

      await expect.soft
        .poll(() => quotePage.price.total(), {
          message: `stepping ${category} back to ${money(from)} should restore the original quote`,
        })
        .toEqual(baseline);
    });
  });

  /**
   * Documented defect, not a flaky test. The page charges the same at $25,000
   * as at $15,000, so raising Loss of use from $20,000 to $25,000 makes the
   * quote *cheaper*, contradicting the rule that more coverage costs more.
   *
   * Encoded as an expected failure so the suite stays green while the defect
   * stays visible in the report. If Lemonade fixes the pricing this test will
   * start passing, and Playwright will fail the run to tell us so.
   */
  test.fail(
    'KNOWN DEFECT: raising Loss of use from $20,000 to $25,000 lowers the premium',
    async ({ quotePage, steps }) => {
      await epic('Renters Quote');
      await feature('Coverage Amounts');
      await story('More coverage should never cost less');
      await severity('critical');
      await parameter('category', 'Loss of use');
      await parameter('from', money(20_000));
      await parameter('to', money(25_000));
      // Playwright records an expected failure as a pass, so without this the
      // defect would be invisible in the report outside the test's title.
      await description(
        [
          'KNOWN DEFECT — this test is expected to fail.',
          '',
          'Loss of use is priced non-monotonically:',
          '',
          '| Amount | $15,000 | $20,000 | $25,000 | $30,000 |',
          '| --- | --- | --- | --- | --- |',
          '| Premium | $14.33 | $14.73 | $14.33 | $15.28 |',
          '',
          'Raising coverage from $20,000 to $25,000 lowers the premium by $0.40,',
          'and lowering it back raises the premium. Reproduced deterministically',
          'in both directions with the price polled to a stable value each step.',
          '',
          'When the pricing is fixed this test will start passing and the run',
          'will fail, which is the signal to remove the `test.fail` marker.',
        ].join('\n'),
      );

      await quotePage.open();
      const baseline = await quotePage.price.total();

      await steps.setCoverageAmount('Loss of use', 20_000);
      await expect
        .poll(() => quotePage.price.total())
        .toEqual(expectedTotal(baseline.amount, 'monthly', coverageChange('Loss of use', 20_000)));

      const at20k = await quotePage.price.total();
      await steps.setCoverageAmount('Loss of use', 25_000);

      await expect
        .poll(() => quotePage.price.total().then((total) => total.amount), { timeout: 3_000 })
        .toBeGreaterThan(at20k.amount);
    },
  );
});

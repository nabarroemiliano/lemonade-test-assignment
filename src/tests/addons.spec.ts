import { epic, feature, parameter, severity, story } from 'allure-js-commons';

import type { AddonKey } from '../data/quote.data';
import { expect, test } from '../fixtures/quote.fixture';
import { addonChange, expectedTotal } from '../support/premium';
import type { AddonDetails } from '../userSteps';

interface AddonCase {
  readonly key: AddonKey;
  /** How the page names the add-on, for readable titles and messages. */
  readonly label: string;
  readonly kind: 'paid' | 'free';
  /** Spelt out per case so each reads as its own claim rather than a derived one. */
  readonly priceExpectation: string;
  /** Present only for add-ons that open a details form before they apply. */
  readonly details?: AddonDetails;
}

const SPOUSE: AddonDetails = { firstName: 'Ada', lastName: 'Lovelace' };

const CASES: readonly AddonCase[] = [
  {
    // The only add-on that applies straight from its toggle; the rest open a
    // dialog first, which would make this a test about dialog mechanics.
    key: 'equipment_breakdown',
    label: 'Appliance Breakdown',
    kind: 'paid',
    priceExpectation: 'should add exactly the premium it advertises',
  },
  {
    // `secondary_insured` is the Spouse row — the key reads like the opposite.
    key: 'secondary_insured',
    label: 'Spouse',
    kind: 'free',
    priceExpectation: 'must leave the quote exactly as it was',
    details: SPOUSE,
  },
];

test.describe('Policy add-ons', () => {
  CASES.forEach(({ key, label, kind, priceExpectation, details }) => {
    test(`switching the ${kind} add-on ${label} on ${priceExpectation}, and off restores the quote`, async ({
      quotePage,
      steps,
    }) => {
      await epic('Renters Quote');
      await feature('Policy Options');
      await story('Toggling an add-on reprices the quote by exactly what it advertises');
      await severity(kind === 'paid' ? 'critical' : 'normal');
      await parameter('addon', key);
      await parameter('kind', kind);

      await quotePage.open();
      const baseline = await quotePage.price.total();
      const row = quotePage.addon(key);
      const change = addonChange(key);

      expect(await row.isSwitchedOn(), `${label} should start switched off`).toBe(false);
      expect
        .soft(await row.advertisedPremium(), `${label} should advertise ${change.delta}/mo`)
        .toBeCloseTo(change.delta, 2);

      await steps.enableAddon(key, details);

      await expect
        .poll(() => row.isSwitchedOn(), { message: `${label} should be switched on` })
        .toBe(true);
      await expect.soft
        .poll(() => quotePage.price.total(), { message: `${label} ${priceExpectation}` })
        .toEqual(expectedTotal(baseline.amount, 'monthly', change));

      await steps.disableAddon(key);

      await expect
        .poll(() => row.isSwitchedOn(), { message: `${label} should be switched off` })
        .toBe(false);
      await expect.soft
        .poll(() => quotePage.price.total(), {
          message: `removing ${label} should restore the original quote`,
        })
        .toEqual(baseline);
    });
  });

  /**
   * Kept separate from the parametrised cases above because only some add-ons
   * capture details. Folding it in would mean asserting something vacuous for
   * Appliance Breakdown, which has no form and nothing to record.
   */
  test('an add-on that asks for details records them on its row', async ({ quotePage, steps }) => {
    await epic('Renters Quote');
    await feature('Policy Options');
    await story('An add-on with a details form applies what was entered');
    await severity('normal');
    await parameter('addon', 'secondary_insured');

    await quotePage.open();
    const row = quotePage.addon('secondary_insured');

    await steps.enableAddon('secondary_insured', SPOUSE);

    await expect
      .poll(() => row.isSwitchedOn(), { message: 'Spouse should be switched on' })
      .toBe(true);
    await expect
      .soft(row.root, 'the row should show the person who was added')
      .toContainText(`${SPOUSE.firstName} ${SPOUSE.lastName}`);
  });
});

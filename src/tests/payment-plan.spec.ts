import { epic, feature, parameter, severity, story } from 'allure-js-commons';

import { ANNUAL_DISCOUNT } from '../data/pricing.data';
import { expect, test } from '../fixtures/quote.fixture';
import {
  addonChange,
  deductibleChange,
  expectedTotal,
  valuableItemChange,
} from '../support/premium';

test.describe('Payment plan', () => {
  test('billing annually charges twelve months less the advertised discount', async ({
    quotePage,
    steps,
  }) => {
    await epic('Renters Quote');
    await feature('Payment Plan');
    await story('Switching between monthly and annual billing');
    await severity('critical');
    await parameter('plan', 'annual');

    await quotePage.open();
    const monthly = await quotePage.price.total();

    expect(await quotePage.paymentPlan.isSelected('monthly'), 'quotes load billed monthly').toBe(
      true,
    );
    expect(monthly.period, 'the monthly quote should be priced per month').toBe('MONTH');
    expect
      .soft(
        await quotePage.paymentPlan.advertisedAnnualDiscount(),
        'the annual option should advertise the discount the model applies',
      )
      .toBe(ANNUAL_DISCOUNT);

    await steps.selectPaymentPlan('annual');

    await expect.soft
      .poll(() => quotePage.price.total(), {
        message: 'the annual quote should be twelve monthly payments less the discount',
      })
      .toEqual(expectedTotal(monthly.amount, 'annual'));

    await steps.selectPaymentPlan('monthly');

    await expect.soft
      .poll(() => quotePage.price.total(), {
        message: 'switching back should restore the monthly quote',
      })
      .toEqual(monthly);
  });

  test('the annual conversion applies to the whole quote, not to each change', async ({
    quotePage,
    steps,
  }) => {
    await epic('Renters Quote');
    await feature('Payment Plan');
    await story('The payment plan composes with every other dimension');
    await severity('normal');
    await parameter('plan', 'annual');

    await quotePage.open();
    const baseline = await quotePage.price.total();

    await steps.addValuableItem('jewelry', 2_000);
    await steps.enableAddon('equipment_breakdown');
    await steps.selectDeductible(250);

    const changes = [
      valuableItemChange('jewelry', 2_000),
      addonChange('equipment_breakdown'),
      deductibleChange(250),
    ] as const;

    await expect
      .poll(() => quotePage.price.total(), {
        message: 'the loaded quote should be the baseline plus every change',
      })
      .toEqual(expectedTotal(baseline.amount, 'monthly', ...changes));

    await steps.selectPaymentPlan('annual');

    await expect.soft
      .poll(() => quotePage.price.total(), {
        message: 'the annual total should convert the loaded monthly total exactly once',
      })
      .toEqual(expectedTotal(baseline.amount, 'annual', ...changes));
  });
});

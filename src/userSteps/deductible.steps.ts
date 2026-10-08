import { test } from '@playwright/test';

import type { DeductibleOption } from '../data/quote.data';
import type { QuotePage } from '../pages/QuotePage';

function exactAmount(amount: number): RegExp {
  return new RegExp(`^\\$${amount.toLocaleString('en-US')}$`);
}

export async function selectDeductible(
  quotePage: QuotePage,
  option: DeductibleOption,
): Promise<void> {
  const amount = option.toLocaleString('en-US');

  return test.step(`select the $${amount} deductible`, async () => {
    const { deductible } = quotePage;

    await test.step('open the deductible dropdown', () => deductible.header.click());
    await deductible.listbox.waitFor({ state: 'visible' });
    await test.step(`click the "$${amount}" option`, () => deductible.optionFor(option).click());
    await deductible.selectedValue.filter({ hasText: exactAmount(option) }).waitFor();
    await deductible.listbox.waitFor({ state: 'hidden' });
  });
}

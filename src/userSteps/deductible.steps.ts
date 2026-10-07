import type { DeductibleOption } from '../data/quote.data';
import type { QuotePage } from '../pages/QuotePage';

export async function selectDeductible(
  quotePage: QuotePage,
  option: DeductibleOption,
): Promise<void> {
  const { deductible } = quotePage;

  await deductible.header.click();
  await deductible.listbox.waitFor({ state: 'visible' });
  await deductible.optionFor(option).click();
}

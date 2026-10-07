import type { DeductibleOption } from '../data/quote.data';
import type { QuotePage } from '../pages/QuotePage';

function exactAmount(amount: number): RegExp {
  return new RegExp(`^\\$${amount.toLocaleString('en-US')}$`);
}

export async function selectDeductible(
  quotePage: QuotePage,
  option: DeductibleOption,
): Promise<void> {
  const { deductible } = quotePage;

  await deductible.header.click();
  await deductible.listbox.waitFor({ state: 'visible' });
  await deductible.optionFor(option).click();
  await deductible.selectedValue.filter({ hasText: exactAmount(option) }).waitFor();
  await deductible.listbox.waitFor({ state: 'hidden' });
}

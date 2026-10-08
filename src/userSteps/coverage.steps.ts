import { test } from '@playwright/test';

import { COVERAGE_LADDERS } from '../data/pricing.data';
import type { CoverageCategory } from '../data/quote.data';
import type { QuotePage } from '../pages/QuotePage';

function ladderFor(category: CoverageCategory): number[] {
  return COVERAGE_LADDERS[category].steps.map((step) => step.option).sort((a, b) => a - b);
}

function exactAmount(amount: number): RegExp {
  return new RegExp(`^\\$${amount.toLocaleString('en-US')}$`);
}

export async function setCoverageAmount(
  quotePage: QuotePage,
  category: CoverageCategory,
  target: number,
): Promise<void> {
  return test.step(`set "${category}" coverage to $${target.toLocaleString('en-US')}`, async () => {
    const ladder = ladderFor(category);
    const targetIndex = ladder.indexOf(target);

    if (targetIndex === -1) {
      throw new Error(`${category} has no option ${target}. Known options: ${ladder.join(', ')}`);
    }

    const card = quotePage.coverage(category);
    let index = ladder.indexOf(await card.amount());

    while (index !== targetIndex) {
      const goingUp = index < targetIndex;
      const next = goingUp ? index + 1 : index - 1;
      const nextAmount = ladder[next].toLocaleString('en-US');

      await test.step(`click "${goingUp ? 'increase' : 'decrease'}" to step to $${nextAmount}`, () =>
        (goingUp ? card.increaseButton : card.decreaseButton).click());
      await card.amountDisplay.filter({ hasText: exactAmount(ladder[next]) }).waitFor();

      index = next;
    }
  });
}

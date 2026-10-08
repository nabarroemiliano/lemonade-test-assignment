import { test } from '@playwright/test';

import { VALUABLE_ITEM_MIN_VALUE, VALUABLE_ITEM_STEP } from '../data/pricing.data';
import type { ValuableItemCategory } from '../data/quote.data';
import type { QuotePage } from '../pages/QuotePage';

export async function openValuableItemDialog(
  quotePage: QuotePage,
  category: ValuableItemCategory,
): Promise<void> {
  const label = category.replace(/_/g, ' ');

  return test.step(`open the "add ${label}" dialog`, async () => {
    await quotePage.valuableItem(category).addButton.click();
    await quotePage.valuableItemDialog.root.waitFor();
  });
}

export async function setValuableItemValue(quotePage: QuotePage, value: number): Promise<void> {
  const clicks = (value - VALUABLE_ITEM_MIN_VALUE) / VALUABLE_ITEM_STEP;

  if (!Number.isInteger(clicks) || clicks < 0) {
    throw new Error(
      `${value} is not reachable: values start at ${VALUABLE_ITEM_MIN_VALUE} and step by ${VALUABLE_ITEM_STEP}`,
    );
  }

  return test.step(`set the declared value to $${value.toLocaleString('en-US')}`, async () => {
    for (let i = 0; i < clicks; i += 1) {
      await quotePage.valuableItemDialog.increaseButton.click();
    }
  });
}

export async function confirmValuableItemAddition(quotePage: QuotePage): Promise<void> {
  return test.step('confirm adding the valuable item', () =>
    quotePage.valuableItemDialog.confirmAddition());
}

export async function addValuableItem(
  quotePage: QuotePage,
  category: ValuableItemCategory,
  value: number,
): Promise<void> {
  const label = category.replace(/_/g, ' ');

  return test.step(`add "${label}" as a valuable item at $${value.toLocaleString('en-US')}`, async () => {
    await openValuableItemDialog(quotePage, category);
    await setValuableItemValue(quotePage, value);
    await confirmValuableItemAddition(quotePage);
  });
}

export async function removeValuableItem(
  quotePage: QuotePage,
  category: ValuableItemCategory,
): Promise<void> {
  const label = category.replace(/_/g, ' ');

  return test.step(`remove the "${label}" valuable item`, async () => {
    await quotePage.valuableItem(category).deleteButton.click();
    await confirmRemoval(quotePage);
  });
}

export async function confirmRemoval(quotePage: QuotePage): Promise<void> {
  return test.step('confirm the removal', async () => {
    const { confirmation } = quotePage;
    await confirmation.root.waitFor();
    await confirmation.confirmButton.click();
    await confirmation.root.waitFor({ state: 'hidden' });
  });
}

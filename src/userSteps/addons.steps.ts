import type { AddonKey, PaymentPlan } from '../data/quote.data';
import type { QuotePage } from '../pages/QuotePage';
import { confirmRemoval } from './valuableItems.steps';

export interface AddonDetails {
  readonly firstName: string;
  readonly lastName: string;
  readonly email?: string;
}

export async function enableAddon(
  quotePage: QuotePage,
  key: AddonKey,
  details?: AddonDetails,
): Promise<void> {
  await quotePage.addon(key).toggle.click();

  if (details === undefined) {
    return;
  }

  const form = quotePage.addonFormDialog;
  await form.root.waitFor();
  await form.firstNameField.fill(details.firstName);
  await form.lastNameField.fill(details.lastName);

  if (details.email !== undefined) {
    await form.emailField.fill(details.email);
  }

  await form.submitButton.click();
  await form.root.waitFor({ state: 'hidden' });
}

export async function disableAddon(quotePage: QuotePage, key: AddonKey): Promise<void> {
  await quotePage.addon(key).toggle.click();
  await confirmRemoval(quotePage);
}

export async function selectPaymentPlan(quotePage: QuotePage, plan: PaymentPlan): Promise<void> {
  await quotePage.paymentPlan.labelFor(plan).click();
}

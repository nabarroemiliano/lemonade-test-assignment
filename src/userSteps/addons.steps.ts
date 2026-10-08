import { test } from '@playwright/test';

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
  const label = key.replace(/_/g, ' ');

  return test.step(`switch on the "${label}" add-on`, async () => {
    await test.step(`click the "${label}" add-on toggle`, () =>
      quotePage.addon(key).toggle.click());

    if (details === undefined) {
      return;
    }

    const form = quotePage.addonFormDialog;
    await form.root.waitFor();

    const emailNote = details.email !== undefined ? `, email: "${details.email}"` : '';

    await test.step(`fill in the add-on details form (first name: "${details.firstName}", last name: "${details.lastName}"${emailNote})`, async () => {
      await form.firstNameField.fill(details.firstName);
      await form.lastNameField.fill(details.lastName);

      if (details.email !== undefined) {
        await form.emailField.fill(details.email);
      }
    });

    await test.step('submit the add-on details form', () => form.submitButton.click());
    await form.root.waitFor({ state: 'hidden' });
  });
}

export async function disableAddon(quotePage: QuotePage, key: AddonKey): Promise<void> {
  const label = key.replace(/_/g, ' ');

  return test.step(`switch off the "${label}" add-on`, async () => {
    await test.step(`click the "${label}" add-on toggle`, () =>
      quotePage.addon(key).toggle.click());
    await confirmRemoval(quotePage);
  });
}

export async function selectPaymentPlan(quotePage: QuotePage, plan: PaymentPlan): Promise<void> {
  return test.step(`select the "${plan}" payment plan`, () =>
    quotePage.paymentPlan.labelFor(plan).click());
}

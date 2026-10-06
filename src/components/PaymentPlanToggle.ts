import type { Locator, Page } from '@playwright/test';

import type { PaymentPlan } from '../data/quote.data';
import { parseMoney, type Money } from '../support/premium';

export class PaymentPlanToggle {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  radioFor(plan: PaymentPlan): Locator {
    return this.page.locator(`input[value="${plan}"]`);
  }

  labelFor(plan: PaymentPlan): Locator {
    return this.page.locator(`input[value="${plan}"] + label`);
  }

  get activeValue(): Locator {
    return this.page.locator('[data-testid="active-value"]');
  }

  async isSelected(plan: PaymentPlan): Promise<boolean> {
    return this.radioFor(plan).isChecked();
  }

  async advertisedAnnualDiscount(): Promise<Money> {
    return parseMoney(await this.labelFor('annual').innerText());
  }
}

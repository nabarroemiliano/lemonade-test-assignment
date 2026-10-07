import type { Locator, Page } from '@playwright/test';

import { parseMoney, type BillingPeriod, type Total } from '../support/premium';

const PAY_BUTTON = /^Pay \$/i;
const BILLING_PERIOD = /\/\s*(MONTH|YEAR)\b/i;

class PayButton {
  readonly root: Locator;

  private readonly label: string;

  constructor(root: Locator, label: string) {
    this.root = root;
    this.label = label;
  }

  async total(): Promise<Total> {
    const text = await this.root.innerText();
    const period = BILLING_PERIOD.exec(text);

    if (period?.[1] === undefined) {
      throw new Error(`The ${this.label} pay button is missing a billing period: "${text}"`);
    }

    return {
      amount: parseMoney(text),
      period: period[1].toUpperCase() as BillingPeriod,
    };
  }
}

export class QuotePricePanel {
  readonly activationContainer: Locator;
  readonly main: PayButton;
  readonly header: PayButton;
  readonly activation: PayButton;

  constructor(page: Page) {
    this.activationContainer = page.locator('[class*="PolicyActivationContainer__"]');

    this.main = new PayButton(page.locator('#gtm_button_pay_main'), 'hero');
    this.header = new PayButton(
      page.locator('header').getByRole('button', { name: PAY_BUTTON }),
      'sticky header',
    );
    this.activation = new PayButton(
      this.activationContainer.getByRole('button', { name: PAY_BUTTON }),
      'policy activation',
    );
  }

  async total(): Promise<Total> {
    return this.main.total();
  }
}

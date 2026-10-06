import type { Locator, Page } from '@playwright/test';

import { parseMoney, type BillingPeriod, type Total } from '../support/premium';

export class QuotePricePanel {
  readonly payButton: Locator;

  constructor(page: Page) {
    this.payButton = page.locator('#gtm_button_pay_main');
  }

  /** `PAY $14.33 / MONTH` -> `{ amount: 14.33, period: 'MONTH' }`. */
  async total(): Promise<Total> {
    const text = await this.payButton.innerText();
    const period = /\/\s*(MONTH|YEAR)\b/i.exec(text);

    if (period?.[1] === undefined) {
      throw new Error(`Pay button is missing a billing period: "${text}"`);
    }

    return {
      amount: parseMoney(text),
      period: period[1].toUpperCase() as BillingPeriod,
    };
  }
}

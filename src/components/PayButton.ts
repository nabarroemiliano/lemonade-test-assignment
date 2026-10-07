import type { Locator } from '@playwright/test';

import { parseMoney, type BillingPeriod, type Total } from '../support/premium';

const BILLING_PERIOD = /\/\s*(MONTH|YEAR)\b/i;

/**
 * One of the quote's Pay buttons. The page renders three — hero, sticky
 * header, and policy activation — and each carries the full total as plain
 * text: `PAY $14.33 / MONTH`.
 */
export class PayButton {
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

import type { Locator, Page } from '@playwright/test';

import type { AddonKey } from '../data/quote.data';
import { parseMoney, type Money } from '../support/premium';

const ADVERTISED_PREMIUM = /\$[\d.,]+\s*\/\s*MO/i;

export class AddonRow {
  readonly root: Locator;
  readonly checkbox: Locator;
  readonly toggle: Locator;

  constructor(root: Locator) {
    this.root = root;
    this.checkbox = root.getByRole('checkbox');
    this.toggle = root.locator('label');
  }

  static for(page: Page, key: AddonKey): AddonRow {
    return new AddonRow(page.locator(`#addon-${key}`));
  }

  async isEnabled(): Promise<boolean> {
    return this.checkbox.isChecked();
  }

  async advertisedPremium(): Promise<Money> {
    const match = ADVERTISED_PREMIUM.exec(await this.root.innerText());
    return match === null ? 0 : parseMoney(match[0]);
  }
}

import type { Locator, Page } from '@playwright/test';

import type { CoverageCategory } from '../data/quote.data';
import { parseMoney, type Money } from '../support/premium';

export class CoverageCard {
  readonly root: Locator;
  readonly heading: Locator;
  readonly amountDisplay: Locator;
  readonly increaseButton: Locator;
  readonly decreaseButton: Locator;

  constructor(root: Locator) {
    this.root = root;
    this.heading = root.getByRole('heading');
    this.amountDisplay = root.locator('[aria-label="input-value"]');
    this.increaseButton = root.getByRole('button', { name: 'increase' });
    this.decreaseButton = root.getByRole('button', { name: 'decrease' });
  }

  static for(page: Page, category: CoverageCategory): CoverageCard {
    return new CoverageCard(
      page
        .locator('.box-white')
        .filter({ has: page.getByRole('heading', { name: category, exact: true }) }),
    );
  }

  async amount(): Promise<Money> {
    return parseMoney(await this.amountDisplay.innerText());
  }

  async canIncrease(): Promise<boolean> {
    return this.increaseButton.isEnabled();
  }

  async canDecrease(): Promise<boolean> {
    return this.decreaseButton.isEnabled();
  }
}

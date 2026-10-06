import type { Locator, Page } from '@playwright/test';

import { parseMoney, type Money } from '../support/premium';

export class ValuableItemDialog {
  readonly root: Locator;
  readonly valueField: Locator;
  readonly increaseButton: Locator;
  readonly decreaseButton: Locator;
  readonly actionButton: Locator;
  readonly closeButton: Locator;

  constructor(page: Page) {
    this.root = page.locator('dialog[open]');
    this.valueField = this.root.getByRole('textbox', { name: 'input-field' });
    this.increaseButton = this.root.getByRole('button', { name: 'increase' });
    this.decreaseButton = this.root.getByRole('button', { name: 'decrease' });
    this.actionButton = this.root.locator('.item-action');
    this.closeButton = this.root.getByRole('button', { name: 'close dialog' });
  }

  async declaredValue(): Promise<Money> {
    return parseMoney(await this.valueField.inputValue());
  }

  async advertisedPremium(): Promise<Money> {
    return parseMoney(await this.actionButton.innerText());
  }

  async confirmAddition(): Promise<void> {
    await this.actionButton.click();
    await this.actionButton.click();
    await this.root.waitFor({ state: 'hidden' });
  }
}

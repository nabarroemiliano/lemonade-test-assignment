import type { Locator, Page } from '@playwright/test';

import type { DeductibleOption } from '../data/quote.data';
import { parseMoney, type Money } from '../support/premium';

export class DeductibleSelect {
  readonly root: Locator;
  readonly header: Locator;
  readonly selectedValue: Locator;
  readonly listbox: Locator;

  constructor(page: Page) {
    this.root = page.locator('.deductible-content');
    this.header = this.root.locator('[data-testid="select-header"]');
    this.selectedValue = this.root.locator('.dropdown-placeholder');
    this.listbox = this.root.getByRole('listbox');
  }

  optionFor(option: DeductibleOption): Locator {
    return this.root.getByRole('option', {
      name: `$${option.toLocaleString('en-US')}`,
      exact: true,
    });
  }

  async selected(): Promise<Money> {
    return parseMoney(await this.selectedValue.innerText());
  }
}

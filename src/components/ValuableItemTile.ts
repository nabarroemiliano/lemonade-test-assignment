import type { Locator, Page } from '@playwright/test';

import type { ValuableItemCategory } from '../data/quote.data';
import { parseMoney, type Money } from '../support/premium';

const ARIA_LABEL: Readonly<Record<ValuableItemCategory, string>> = {
  jewelry: 'jewelry',
  bicycles: 'bicycles',
  cameras: 'cameras',
  musical_instruments: 'musical instruments',
  fine_art: 'fine art',
};

const ADVERTISED_PREMIUM = /\+\s*\$[\d.,]+\s*\/\s*MO/i;

export class ValuableItemTile {
  readonly root: Locator;
  readonly addButton: Locator;
  readonly deleteButton: Locator;

  private readonly category: ValuableItemCategory;

  constructor(root: Locator, category: ValuableItemCategory) {
    this.root = root;
    this.category = category;
    this.addButton = root.getByRole('button', { name: 'add' });
    this.deleteButton = root.getByRole('button', { name: 'delete' });
  }

  static for(page: Page, category: ValuableItemCategory): ValuableItemTile {
    return new ValuableItemTile(
      page.locator(`#valuable-items [aria-label="${ARIA_LABEL[category]}"]`),
      category,
    );
  }

  async isCovered(): Promise<boolean> {
    return (await this.deleteButton.count()) > 0;
  }

  async declaredValue(): Promise<Money> {
    return parseMoney(await this.root.innerText());
  }

  async advertisedPremium(): Promise<Money> {
    const text = await this.root.innerText();
    const match = ADVERTISED_PREMIUM.exec(text);

    if (match === null) {
      throw new Error(`No advertised premium on the ${this.category} tile: "${text}"`);
    }

    return parseMoney(match[0]);
  }
}

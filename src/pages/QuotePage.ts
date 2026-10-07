import type { Page } from '@playwright/test';

import { AddonFormDialog } from '../components/AddonFormDialog';
import { AddonRow } from '../components/AddonRow';
import { ConfirmationDialog } from '../components/ConfirmationDialog';
import { CoverageCard } from '../components/CoverageCard';
import { DeductibleSelect } from '../components/DeductibleSelect';
import { PaymentPlanToggle } from '../components/PaymentPlanToggle';
import { QuotePricePanel } from '../components/QuotePricePanel';
import { ValuableItemDialog } from '../components/ValuableItemDialog';
import { ValuableItemTile } from '../components/ValuableItemTile';
import {
  quoteData,
  type AddonKey,
  type CoverageCategory,
  type ValuableItemCategory,
} from '../data/quote.data';
import { BasePage } from './BasePage';

export class QuotePage extends BasePage {
  readonly price: QuotePricePanel;
  readonly paymentPlan: PaymentPlanToggle;
  readonly deductible: DeductibleSelect;
  readonly confirmation: ConfirmationDialog;
  readonly valuableItemDialog: ValuableItemDialog;
  readonly addonFormDialog: AddonFormDialog;

  constructor(page: Page) {
    super(page);
    this.price = new QuotePricePanel(page);
    this.paymentPlan = new PaymentPlanToggle(page);
    this.deductible = new DeductibleSelect(page);
    this.confirmation = new ConfirmationDialog(page);
    this.valuableItemDialog = new ValuableItemDialog(page);
    this.addonFormDialog = new AddonFormDialog(page);
  }

  async open(quoteId: string = quoteData.quoteId): Promise<void> {
    await this.goto(`quotes/${quoteId}`);
    await this.verifyLoaded();
  }

  /** The Pay button is the last thing to settle, so it gates everything else. */
  async verifyLoaded(): Promise<void> {
    await this.price.main.root.waitFor({ state: 'visible' });
  }

  coverage(category: CoverageCategory): CoverageCard {
    return CoverageCard.for(this.page, category);
  }

  valuableItem(category: ValuableItemCategory): ValuableItemTile {
    return ValuableItemTile.for(this.page, category);
  }

  addon(key: AddonKey): AddonRow {
    return AddonRow.for(this.page, key);
  }
}

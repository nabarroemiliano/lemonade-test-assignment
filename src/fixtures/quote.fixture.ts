import { test as base } from '@playwright/test';

import type {
  AddonKey,
  CoverageCategory,
  DeductibleOption,
  PaymentPlan,
  ValuableItemCategory,
} from '../data/quote.data';
import { QuotePage } from '../pages/QuotePage';
import {
  addValuableItem,
  confirmRemoval,
  confirmValuableItemAddition,
  disableAddon,
  enableAddon,
  openValuableItemDialog,
  removeValuableItem,
  selectDeductible,
  scrollToStickyHeader,
  selectPaymentPlan,
  setCoverageAmount,
  setValuableItemValue,
  type AddonDetails,
} from '../userSteps';

const COOKIE_BANNER_ACCEPTED = '_lmnd_cookie_banner_accepted';

/** What a user can do to a quote, with the page object already bound in. */
export interface UserSteps {
  setCoverageAmount: (category: CoverageCategory, target: number) => Promise<void>;
  openValuableItemDialog: (category: ValuableItemCategory) => Promise<void>;
  setValuableItemValue: (value: number) => Promise<void>;
  confirmValuableItemAddition: () => Promise<void>;
  addValuableItem: (category: ValuableItemCategory, value: number) => Promise<void>;
  removeValuableItem: (category: ValuableItemCategory) => Promise<void>;
  confirmRemoval: () => Promise<void>;
  enableAddon: (key: AddonKey, details?: AddonDetails) => Promise<void>;
  disableAddon: (key: AddonKey) => Promise<void>;
  selectDeductible: (option: DeductibleOption) => Promise<void>;
  selectPaymentPlan: (plan: PaymentPlan) => Promise<void>;
  scrollToStickyHeader: () => Promise<void>;
}

interface QuoteFixtures {
  quotePage: QuotePage;
  steps: UserSteps;
}

export const test = base.extend<QuoteFixtures>({
  context: async ({ context, baseURL }, use) => {
    if (baseURL === undefined) {
      throw new Error('baseURL must be configured so the consent cookie can be scoped to it');
    }

    await context.addCookies([
      {
        name: COOKIE_BANNER_ACCEPTED,
        value: 'true',
        domain: new URL(baseURL).hostname,
        path: '/',
      },
    ]);

    await use(context);
  },

  quotePage: async ({ page }, use) => {
    await use(new QuotePage(page));
  },

  steps: async ({ quotePage }, use) => {
    await use({
      setCoverageAmount: (category, target) => setCoverageAmount(quotePage, category, target),
      openValuableItemDialog: (category) => openValuableItemDialog(quotePage, category),
      setValuableItemValue: (value) => setValuableItemValue(quotePage, value),
      confirmValuableItemAddition: () => confirmValuableItemAddition(quotePage),
      addValuableItem: (category, value) => addValuableItem(quotePage, category, value),
      removeValuableItem: (category) => removeValuableItem(quotePage, category),
      confirmRemoval: () => confirmRemoval(quotePage),
      enableAddon: (key, details) => enableAddon(quotePage, key, details),
      disableAddon: (key) => disableAddon(quotePage, key),
      selectDeductible: (option) => selectDeductible(quotePage, option),
      selectPaymentPlan: (plan) => selectPaymentPlan(quotePage, plan),
      scrollToStickyHeader: () => scrollToStickyHeader(quotePage),
    });
  },
});

export const expect = test.expect;

import type { Page } from '@playwright/test';

import type { Total } from '../support/premium';
import { PayButton } from './PayButton';

const PAY_BUTTON = /^Pay \$/i;

/**
 * The quote total.
 *
 * The page shows the same total on three Pay buttons. `total()` reads the hero
 * one and is the canonical source for every pricing assertion — it is the only
 * price on the page with a real id, it is present without scrolling, and
 * repeating the same assertion against all three would triple the assertions
 * for no extra information. That the three agree is a separate risk, covered
 * once by `price-consistency.spec.ts`.
 *
 * The headline figure above the hero button is deliberately unused: it is an
 * animated digit reel whose only unique anchor is a styled-components hash.
 */
export class QuotePricePanel {
  /** Hero button. The canonical price. */
  readonly main: PayButton;
  /** Sticky header button — only rendered once the page is scrolled. */
  readonly header: PayButton;
  /** Button in the "Activate Your Insurance" section at the foot of the page. */
  readonly activation: PayButton;

  constructor(page: Page) {
    this.main = new PayButton(page.locator('#gtm_button_pay_main'), 'hero');
    this.header = new PayButton(
      page.locator('header').getByRole('button', { name: PAY_BUTTON }),
      'sticky header',
    );
    this.activation = new PayButton(
      // The activation button has no id and only hashed classes of its own, so
      // it is reached through its section wrapper, whose class is derived from
      // the component name rather than generated per build.
      page
        .locator('[class*="PolicyActivationContainer__"]')
        .getByRole('button', { name: PAY_BUTTON }),
      'policy activation',
    );
  }

  async total(): Promise<Total> {
    return this.main.total();
  }
}

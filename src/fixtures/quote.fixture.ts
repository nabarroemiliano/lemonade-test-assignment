import { test as base } from '@playwright/test';

import { QuotePage } from '../pages/QuotePage';

const COOKIE_BANNER_ACCEPTED = '_lmnd_cookie_banner_accepted';

interface QuoteFixtures {
  quotePage: QuotePage;
}

export const test = base.extend<QuoteFixtures>({
  context: async ({ context, baseURL }, use) => {
    if (baseURL === undefined) {
      throw new Error('baseURL must be configured so the consent cookie can be scoped to it');
    }
/** Accept cookie and override context before first load of the base URL */
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
});

export const expect = test.expect;

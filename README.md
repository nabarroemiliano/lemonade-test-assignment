# Lemonade Quote — E2E Test Framework

End-to-end tests for the [Lemonade quote page](https://lemonade-hq.github.io/qa-interview-task/quotes/LQ42EE07089), built with **Playwright + TypeScript**, organised around the **Page Object + Component Object** pattern, and reported through **Allure**.

The suite verifies that the quote price changes correctly when coverage amounts, extra coverage for valuable items, add-ons, the deductible and the payment plan change — and it found one pricing defect along the way, written up at the bottom of this file.

---

## Running it locally

```bash
nvm use                                      # Node 22, from .nvmrc
npm ci
npx playwright install --with-deps chromium

npm test                                     # headless, fully parallel
npm run test:headed                          # headed
npm run test:ui                              # Playwright UI mode
npm run report                               # generate + open the Allure report
npm run clean:allure                         # wipe allure-results
```

`npm run report` needs the Allure CLI (`brew install allure`) and a JDK on your `PATH`.

Point the suite somewhere else with `.env` — see `.env.example`:

| Variable   | Default                                            |
| ---------- | -------------------------------------------------- |
| `BASE_URL` | `https://lemonade-hq.github.io/qa-interview-task/` |
| `QUOTE_ID` | `LQ42EE07089`                                      |

---

## What's covered

16 tests across 6 specs, all passing headless. Every case is its own Playwright test with its own
browser context — no shared state, no ordering requirement.

| Spec                             | Tests | What it asserts                                                                                                                                                                                                     |
| -------------------------------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `coverage-amount.spec.ts`        | 3 + 1 | Stepping Personal Liability up, Personal Property down and Loss of use up reprices by the modelled delta; stepping back restores the original quote. Plus one expected-failure test pinning defect #1.              |
| `valuable-item-coverage.spec.ts` | 2     | Jewelry at $1,000 and bicycles at $3,000: the dialog's advertised premium matches the model, the tile agrees with the dialog, the quote is charged exactly that, and deleting it refunds in full.                   |
| `addons.spec.ts`                 | 3     | A paid add-on (Appliance Breakdown) charges exactly what its row advertises; a Free one (Spouse) leaves the quote untouched; both restore on removal. Plus: an add-on with a details form records what was entered. |
| `deductible.spec.ts`             | 3     | $250 (lower) raises the premium, $1,000 and $2,500 (higher) lower it, each by the modelled delta, with the dropdown reflecting the choice.                                                                          |
| `payment-plan.spec.ts`           | 2     | Annual billing charges `monthly × 12 − $12`, matching the discount the page advertises; and the same conversion holds on a quote loaded across three other dimensions.                                              |
| `price-consistency.spec.ts`      | 2     | The hero, sticky-header and activation Pay buttons never disagree — after a reprice, and in annual billing (amount *and* period).                                                                                   |

---

## Architecture

```
src/
├── components/                   # Locators + typed getters. No assertions.
│   ├── QuotePricePanel.ts
│   ├── PaymentPlanToggle.ts
│   ├── CoverageCard.ts
│   ├── ...
├── pages/
│   ├── BasePage.ts
│   └── QuotePage.ts              # child accessors, parameterised by domain value
├── support/
│   └── premium.ts                # the pricing calculator use for assertions
├── userSteps/                    # Reusable user intents.
│   ├── coverage.steps.ts
│   ├── valuableItems.steps.ts
│   ├── addons.steps.ts
│   ├── deductible.steps.ts
│   ├── navigation.steps.ts
│   └── index.ts
├── fixtures/
│   └── quote.fixture.ts          # cookie bypass, page object initialization, bound `steps`
├── data/
│   ├── quote.data.ts             # the domain vocabulary
│   └── pricing.data.ts           # measured pricing deltas
└── tests/
```

---

## The pricing model

`src/support/premium.ts` computes the expected total; `src/data/pricing.data.ts` holds the measured
structure. Composition across dimensions is **purely additive**, then the payment plan converts the
total.

```
monthlyTotal = monthlyBaseline + deltas
annualTotal  = monthlyTotal × 12 − $12.00
```

---

## Defect found

### Loss of use is priced non-monotonically

| Amount  | $15,000 | $20,000 | $25,000    | $30,000 |
| ------- | ------- | ------- | ---------- | ------- |
| Premium | $14.33  | $14.73  | **$14.33** | $15.28  |

Raising coverage from $20,000 to $25,000 **lowers** the premium by $0.40, and lowering it back
raises it — a direct contradiction of the rule that more coverage costs more.

Captured as a `test.fail()` test so the suite stays green while the defect stays recorded.

---

## Continuous integration

`.github/workflows/ci.yaml` runs on `workflow_dispatch` only, with `base_url` and `quote_id`
overridable at dispatch time. The system under test is a third-party mock we do not control, so no
commit in this repo can change its behaviour therefore there is no gate at pull request.

---

## Known gaps

- **Chromium only.** To keep it simple I focused only on Chromium, but it could be easily extended to other browsers.
- **Coverage is demostrative.** Because the tests are parameterized, the suite is easily extensible to support additional use case combinations.
- **Lower level tests are left out of scope.** i.e: input validations on extra coverage cards, it should be covered with unit tests.
- **Valuable-item custom values.** For simplicity I used default increased values ($1000), not custom typed values.

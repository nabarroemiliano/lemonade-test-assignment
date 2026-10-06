import {
  ADDON_PREMIUM,
  ANNUAL_DISCOUNT,
  COVERAGE_LADDERS,
  DEDUCTIBLE_LADDER,
  MONTHS_PER_YEAR,
  VALUABLE_ITEM_RATE_PER_1000,
  type Ladder,
} from '../data/pricing.data';
import type {
  AddonKey,
  CoverageCategory,
  DeductibleOption,
  PaymentPlan,
  ValuableItemCategory,
} from '../data/quote.data';

export type Money = number;

export type BillingPeriod = 'MONTH' | 'YEAR';

export type PremiumDimension = 'coverage' | 'valuableItem' | 'addon' | 'deductible';

export interface PremiumChange {
  readonly dimension: PremiumDimension;
  readonly label: string;
  readonly delta: Money;
}

export interface Total {
  readonly amount: Money;
  readonly period: BillingPeriod;
}

/** Matches the currency amount in the text of the page. */
const CURRENCY_PATTERN = /\$\s*([\d,]+(?:\.\d+)?)/;

function roundToCents(value: Money): Money {
  return Math.round(value * 100) / 100;
}

export function parseMoney(text: string): Money {
  const match = CURRENCY_PATTERN.exec(text);
  if (match?.[1] === undefined) {
    throw new Error(`No currency amount found in "${text}"`);
  }
  return Number.parseFloat(match[1].replace(/,/g, ''));
}

function deltaFor(ladder: Ladder, option: number, ladderName: string): Money {
  const step = ladder.steps.find((candidate) => candidate.option === option);
  if (step === undefined) {
    const known = ladder.steps.map((candidate) => candidate.option).join(', ');
    throw new Error(`${ladderName} has no option ${option}. Known options: ${known}`);
  }
  return step.delta;
}

export function coverageChange(
  category: CoverageCategory,
  to: number,
  from: number = COVERAGE_LADDERS[category].defaultOption,
): PremiumChange {
  const ladder = COVERAGE_LADDERS[category];
  const delta = deltaFor(ladder, to, category) - deltaFor(ladder, from, category);
  return {
    dimension: 'coverage',
    label: `${category} ${formatAmount(from)} -> ${formatAmount(to)}`,
    delta: roundToCents(delta),
  };
}

export function valuableItemChange(category: ValuableItemCategory, value: Money): PremiumChange {
  const delta = (VALUABLE_ITEM_RATE_PER_1000[category] * value) / 1000;
  return {
    dimension: 'valuableItem',
    label: `${category} ${formatAmount(value)}`,
    delta: roundToCents(delta),
  };
}

export function addonChange(key: AddonKey): PremiumChange {
  return {
    dimension: 'addon',
    label: key,
    delta: ADDON_PREMIUM[key],
  };
}

export function deductibleChange(
  to: DeductibleOption,
  from: DeductibleOption = DEDUCTIBLE_LADDER.defaultOption,
): PremiumChange {
  const delta =
    deltaFor(DEDUCTIBLE_LADDER, to, 'Deductible') - deltaFor(DEDUCTIBLE_LADDER, from, 'Deductible');
  return {
    dimension: 'deductible',
    label: `deductible ${formatAmount(from)} -> ${formatAmount(to)}`,
    delta: roundToCents(delta),
  };
}

export function reverse(change: PremiumChange): PremiumChange {
  return { ...change, label: `revert ${change.label}`, delta: roundToCents(-change.delta) };
}

export function expectedTotal(
  monthlyBaseline: Money,
  plan: PaymentPlan,
  ...changes: readonly PremiumChange[]
): Total {
  const monthly = roundToCents(
    changes.reduce((running, change) => running + change.delta, monthlyBaseline),
  );

  if (plan === 'annual') {
    return {
      amount: roundToCents(monthly * MONTHS_PER_YEAR - ANNUAL_DISCOUNT),
      period: 'YEAR',
    };
  }

  return { amount: monthly, period: 'MONTH' };
}

function formatAmount(value: Money): string {
  return `$${value.toLocaleString('en-US')}`;
}

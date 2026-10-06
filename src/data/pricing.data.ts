import type {
  AddonKey,
  CoverageCategory,
  DeductibleOption,
  ValuableItemCategory,
} from './quote.data';

export interface LadderStep<TOption extends number = number> {
  readonly option: TOption;
  readonly delta: number;
}

export interface Ladder<TOption extends number = number> {
  readonly defaultOption: TOption;
  readonly steps: ReadonlyArray<LadderStep<TOption>>;
}

export const COVERAGE_LADDERS: Readonly<Record<CoverageCategory, Ladder>> = {
  'Personal Property': {
    defaultOption: 50_000,
    steps: [
      { option: 30_000, delta: -1.2 },
      { option: 35_000, delta: -0.8 },
      { option: 40_000, delta: -0.45 },
      { option: 45_000, delta: -0.2 },
      { option: 50_000, delta: 0 },
    ],
  },
  'Personal Liability': {
    defaultOption: 100_000,
    steps: [
      { option: 100_000, delta: 0 },
      { option: 300_000, delta: 1.1 },
      { option: 500_000, delta: 2.35 },
    ],
  },
  'Loss of use': {
    defaultOption: 15_000,
    steps: [
      { option: 15_000, delta: 0 },
      { option: 20_000, delta: 0.4 },
      { option: 25_000, delta: 0 },
      { option: 30_000, delta: 0.95 },
    ],
  },
  'Medical payments to others': {
    defaultOption: 1_000,
    steps: [
      { option: 1_000, delta: 0 },
      { option: 2_000, delta: 0 },
      { option: 3_000, delta: 0 },
      { option: 4_000, delta: 0 },
      { option: 5_000, delta: 0.6 },
    ],
  },
};

export const DEDUCTIBLE_LADDER: Ladder<DeductibleOption> = {
  defaultOption: 500,
  steps: [
    { option: 250, delta: 2.25 },
    { option: 500, delta: 0 },
    { option: 1000, delta: -1.15 },
    { option: 2500, delta: -2.65 },
  ],
};

/** For simplicity, I use the delta per $1000 of valuable item, even though the input accepts custom values. */
export const VALUABLE_ITEM_RATE_PER_1000: Readonly<Record<ValuableItemCategory, number>> = {
  jewelry: 0.92,
  bicycles: 1.83,
  cameras: 0.92,
  musical_instruments: 0.17,
  fine_art: 0.67,
};

export const VALUABLE_ITEM_MIN_VALUE = 1_000;
export const VALUABLE_ITEM_STEP = 1_000;

export const ADDON_PREMIUM: Readonly<Record<AddonKey, number>> = {
  interested_party: 0,
  secondary_insured: 0,
  other_members_of_household: 1.67,
  water_backup: 0.83,
  landlord_property_damage: 0.5,
  equipment_breakdown: 3.0,
};

export const MONTHS_PER_YEAR = 12;
export const ANNUAL_DISCOUNT = 12.0;

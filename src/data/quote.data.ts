export const COVERAGE_CATEGORIES = [
  'Personal Property',
  'Personal Liability',
  'Loss of use',
  'Medical payments to others',
] as const;

export type CoverageCategory = (typeof COVERAGE_CATEGORIES)[number];

export const VALUABLE_ITEM_CATEGORIES = [
  'jewelry',
  'bicycles',
  'cameras',
  'musical_instruments',
  'fine_art',
] as const;

export type ValuableItemCategory = (typeof VALUABLE_ITEM_CATEGORIES)[number];

export const ADDON_KEYS = [
  'interested_party',
  'secondary_insured',
  'other_members_of_household',
  'water_backup',
  'landlord_property_damage',
  'equipment_breakdown',
] as const;

export type AddonKey = (typeof ADDON_KEYS)[number];

export const DEDUCTIBLE_OPTIONS = [250, 500, 1000, 2500] as const;

export type DeductibleOption = (typeof DEDUCTIBLE_OPTIONS)[number];

export const PAYMENT_PLANS = ['monthly', 'annual'] as const;

export type PaymentPlan = (typeof PAYMENT_PLANS)[number];

export interface QuoteDataset {
  readonly quoteId: string;
}

export const quoteData: QuoteDataset = {
  quoteId: process.env.QUOTE_ID?.trim() || 'LQ42EE07089',
};

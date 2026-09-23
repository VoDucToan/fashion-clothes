/**
 * Fixed primary keys for seeded rows.
 *
 * None of the lookup tables has a unique natural key, so `upsert` needs a
 * known id to stay idempotent — without one, every run inserts duplicates.
 */

export const COUNTRY_IDS = {
  vietnam: '0199a100-0000-7000-8000-000000000001',
  singapore: '0199a100-0000-7000-8000-000000000002',
} as const;

export const PAYMENT_TYPE_IDS = {
  cashOnDelivery: '0199a200-0000-7000-8000-000000000001',
  creditCard: '0199a200-0000-7000-8000-000000000002',
  bankTransfer: '0199a200-0000-7000-8000-000000000003',
} as const;

export const SHIPPING_METHOD_IDS = {
  standard: '0199a300-0000-7000-8000-000000000001',
  express: '0199a300-0000-7000-8000-000000000002',
} as const;

export const ORDER_STATUS_IDS = {
  pending: '0199a400-0000-7000-8000-000000000001',
  paid: '0199a400-0000-7000-8000-000000000002',
  shipped: '0199a400-0000-7000-8000-000000000003',
  delivered: '0199a400-0000-7000-8000-000000000004',
  cancelled: '0199a400-0000-7000-8000-000000000005',
} as const;

export const CATEGORY_IDS = {
  apparel: '0199b100-0000-7000-8000-000000000001',
  hoodies: '0199b100-0000-7000-8000-000000000002',
  tshirts: '0199b100-0000-7000-8000-000000000003',
} as const;

export const VARIATION_IDS = {
  hoodieColour: '0199b200-0000-7000-8000-000000000001',
  hoodieSize: '0199b200-0000-7000-8000-000000000002',
  teeSize: '0199b200-0000-7000-8000-000000000003',
} as const;

export const VARIATION_OPTION_IDS = {
  hoodieBlack: '0199b300-0000-7000-8000-000000000001',
  hoodieWhite: '0199b300-0000-7000-8000-000000000002',
  hoodieM: '0199b300-0000-7000-8000-000000000003',
  hoodieL: '0199b300-0000-7000-8000-000000000004',
  teeM: '0199b300-0000-7000-8000-000000000005',
  teeL: '0199b300-0000-7000-8000-000000000006',
} as const;

export const PRODUCT_IDS = {
  oversizedHoodie: '0199b400-0000-7000-8000-000000000001',
  classicTee: '0199b400-0000-7000-8000-000000000002',
} as const;

export const PRODUCT_ITEM_IDS = {
  oversizedHoodieBlackM: '0199b500-0000-7000-8000-000000000001',
  oversizedHoodieBlackL: '0199b500-0000-7000-8000-000000000002',
  oversizedHoodieWhiteM: '0199b500-0000-7000-8000-000000000003',
  oversizedHoodieWhiteL: '0199b500-0000-7000-8000-000000000004',
  classicTeeM: '0199b500-0000-7000-8000-000000000005',
  classicTeeL: '0199b500-0000-7000-8000-000000000006',
} as const;

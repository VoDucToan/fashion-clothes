import type { PrismaClient } from '../../src/generated/prisma/client.js';

import {
  CATEGORY_IDS,
  PRODUCT_IDS,
  PRODUCT_ITEM_IDS,
  VARIATION_IDS,
  VARIATION_OPTION_IDS,
} from './ids.js';

// Parents first — a child row cannot point at a category that does not exist yet.
const categories = [
  { id: CATEGORY_IDS.apparel, parentCategoryId: null, categoryName: 'Apparel' },
  {
    id: CATEGORY_IDS.hoodies,
    parentCategoryId: CATEGORY_IDS.apparel,
    categoryName: 'Hoodies',
  },
  {
    id: CATEGORY_IDS.tshirts,
    parentCategoryId: CATEGORY_IDS.apparel,
    categoryName: 'T-Shirts',
  },
];

// Variations hang off a category, so each category declares its own axes.
const variations = [
  {
    id: VARIATION_IDS.hoodieColour,
    categoryId: CATEGORY_IDS.hoodies,
    name: 'Colour',
  },
  {
    id: VARIATION_IDS.hoodieSize,
    categoryId: CATEGORY_IDS.hoodies,
    name: 'Size',
  },
  { id: VARIATION_IDS.teeSize, categoryId: CATEGORY_IDS.tshirts, name: 'Size' },
];

const variationOptions = [
  {
    id: VARIATION_OPTION_IDS.hoodieBlack,
    variationId: VARIATION_IDS.hoodieColour,
    value: 'Black',
  },
  {
    id: VARIATION_OPTION_IDS.hoodieWhite,
    variationId: VARIATION_IDS.hoodieColour,
    value: 'White',
  },
  {
    id: VARIATION_OPTION_IDS.hoodieM,
    variationId: VARIATION_IDS.hoodieSize,
    value: 'M',
  },
  {
    id: VARIATION_OPTION_IDS.hoodieL,
    variationId: VARIATION_IDS.hoodieSize,
    value: 'L',
  },
  {
    id: VARIATION_OPTION_IDS.teeM,
    variationId: VARIATION_IDS.teeSize,
    value: 'M',
  },
  {
    id: VARIATION_OPTION_IDS.teeL,
    variationId: VARIATION_IDS.teeSize,
    value: 'L',
  },
];

const products = [
  {
    id: PRODUCT_IDS.oversizedHoodie,
    categoryId: CATEGORY_IDS.hoodies,
    name: 'Oversized Hoodie',
    description: 'Heavyweight cotton fleece, dropped shoulders, boxy fit.',
    productImage: 'https://placehold.co/800x1000?text=Oversized+Hoodie',
  },
  {
    id: PRODUCT_IDS.classicTee,
    categoryId: CATEGORY_IDS.tshirts,
    name: 'Classic Tee',
    description: 'Combed cotton, regular fit, ribbed collar.',
    productImage: 'https://placehold.co/800x1000?text=Classic+Tee',
  },
];

// Prices are strings: JS floats cannot hold Decimal(10,2) exactly.
const productItems = [
  {
    id: PRODUCT_ITEM_IDS.oversizedHoodieBlackM,
    productId: PRODUCT_IDS.oversizedHoodie,
    sku: 'HOODIE-OVS-BLK-M',
    qtyInStock: 24,
    price: '450000.00',
    productImage: 'https://placehold.co/800x1000?text=Hoodie+Black+M',
    options: [VARIATION_OPTION_IDS.hoodieBlack, VARIATION_OPTION_IDS.hoodieM],
  },
  {
    id: PRODUCT_ITEM_IDS.oversizedHoodieBlackL,
    productId: PRODUCT_IDS.oversizedHoodie,
    sku: 'HOODIE-OVS-BLK-L',
    qtyInStock: 18,
    price: '450000.00',
    productImage: 'https://placehold.co/800x1000?text=Hoodie+Black+L',
    options: [VARIATION_OPTION_IDS.hoodieBlack, VARIATION_OPTION_IDS.hoodieL],
  },
  {
    id: PRODUCT_ITEM_IDS.oversizedHoodieWhiteM,
    productId: PRODUCT_IDS.oversizedHoodie,
    sku: 'HOODIE-OVS-WHT-M',
    qtyInStock: 0,
    price: '450000.00',
    productImage: 'https://placehold.co/800x1000?text=Hoodie+White+M',
    options: [VARIATION_OPTION_IDS.hoodieWhite, VARIATION_OPTION_IDS.hoodieM],
  },
  {
    id: PRODUCT_ITEM_IDS.oversizedHoodieWhiteL,
    productId: PRODUCT_IDS.oversizedHoodie,
    sku: 'HOODIE-OVS-WHT-L',
    qtyInStock: 7,
    price: '470000.00',
    productImage: 'https://placehold.co/800x1000?text=Hoodie+White+L',
    options: [VARIATION_OPTION_IDS.hoodieWhite, VARIATION_OPTION_IDS.hoodieL],
  },
  {
    id: PRODUCT_ITEM_IDS.classicTeeM,
    productId: PRODUCT_IDS.classicTee,
    sku: 'TEE-CLS-M',
    qtyInStock: 40,
    price: '190000.00',
    productImage: 'https://placehold.co/800x1000?text=Tee+M',
    options: [VARIATION_OPTION_IDS.teeM],
  },
  {
    id: PRODUCT_ITEM_IDS.classicTeeL,
    productId: PRODUCT_IDS.classicTee,
    sku: 'TEE-CLS-L',
    qtyInStock: 35,
    price: '190000.00',
    productImage: 'https://placehold.co/800x1000?text=Tee+L',
    options: [VARIATION_OPTION_IDS.teeL],
  },
];

/**
 * Demo shop window: enough breadth to build listing, filtering and
 * out-of-stock states against. Development only.
 */
export async function seedCatalog(prisma: PrismaClient): Promise<void> {
  for (const { id, ...data } of categories) {
    await prisma.productCategory.upsert({
      where: { id },
      create: { id, ...data },
      update: data,
    });
  }

  for (const { id, ...data } of variations) {
    await prisma.variation.upsert({
      where: { id },
      create: { id, ...data },
      update: data,
    });
  }

  for (const { id, ...data } of variationOptions) {
    await prisma.variationOption.upsert({
      where: { id },
      create: { id, ...data },
      update: data,
    });
  }

  for (const { id, ...data } of products) {
    await prisma.product.upsert({
      where: { id },
      create: { id, ...data },
      update: data,
    });
  }

  for (const { id, options, ...data } of productItems) {
    await prisma.productItem.upsert({
      where: { id },
      create: { id, ...data },
      update: data,
    });

    for (const variationOptionId of options) {
      // Both columns are the primary key, so there is nothing to update.
      await prisma.productConfiguration.upsert({
        where: {
          productItemId_variationOptionId: {
            productItemId: id,
            variationOptionId,
          },
        },
        create: { productItemId: id, variationOptionId },
        update: {},
      });
    }
  }

  console.log(
    `Catalog: ${categories.length} categories, ${products.length} products, ` +
      `${productItems.length} SKUs`,
  );
}

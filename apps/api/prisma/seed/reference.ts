import type { PrismaClient } from '../../src/generated/prisma/client.js';

import {
  COUNTRY_IDS,
  ORDER_STATUS_IDS,
  PAYMENT_TYPE_IDS,
  SHIPPING_METHOD_IDS,
} from './ids.js';

const countries = [
  { id: COUNTRY_IDS.vietnam, countryName: 'Vietnam' },
  { id: COUNTRY_IDS.singapore, countryName: 'Singapore' },
];

const paymentTypes = [
  { id: PAYMENT_TYPE_IDS.cashOnDelivery, value: 'Cash on delivery' },
  { id: PAYMENT_TYPE_IDS.creditCard, value: 'Credit card' },
  { id: PAYMENT_TYPE_IDS.bankTransfer, value: 'Bank transfer' },
];

const shippingMethods = [
  {
    id: SHIPPING_METHOD_IDS.standard,
    name: 'Standard (3-5 days)',
    price: '30000.00',
  },
  {
    id: SHIPPING_METHOD_IDS.express,
    name: 'Express (1-2 days)',
    price: '60000.00',
  },
];

const orderStatuses = [
  { id: ORDER_STATUS_IDS.pending, status: 'PENDING' },
  { id: ORDER_STATUS_IDS.paid, status: 'PAID' },
  { id: ORDER_STATUS_IDS.shipped, status: 'SHIPPED' },
  { id: ORDER_STATUS_IDS.delivered, status: 'DELIVERED' },
  { id: ORDER_STATUS_IDS.cancelled, status: 'CANCELLED' },
];

/**
 * Rows the application cannot function without. These are not test data —
 * they belong in every environment, production included.
 */
export async function seedReference(prisma: PrismaClient): Promise<void> {
  for (const { id, ...data } of countries) {
    await prisma.country.upsert({
      where: { id },
      create: { id, ...data },
      update: data,
    });
  }

  for (const { id, ...data } of paymentTypes) {
    await prisma.paymentType.upsert({
      where: { id },
      create: { id, ...data },
      update: data,
    });
  }

  for (const { id, ...data } of shippingMethods) {
    await prisma.shippingMethod.upsert({
      where: { id },
      create: { id, ...data },
      update: data,
    });
  }

  for (const { id, ...data } of orderStatuses) {
    await prisma.orderStatus.upsert({
      where: { id },
      create: { id, ...data },
      update: data,
    });
  }

  console.log(
    `Reference: ${countries.length} countries, ${paymentTypes.length} payment types, ` +
      `${shippingMethods.length} shipping methods, ${orderStatuses.length} order statuses`,
  );
}

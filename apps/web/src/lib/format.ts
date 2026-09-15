import { siteConfig } from "@/config/site";

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: siteConfig.currency,
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("vi-VN", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Ho_Chi_Minh",
});

/**
 * Prices cross the wire as integer đồng — never as floats. Money in a
 * float is how you end up with a 1đ discrepancy in reconciliation.
 */
export function formatPrice(amount: number) {
  return currencyFormatter.format(amount);
}

export function formatDateTime(value: string | number | Date) {
  return dateFormatter.format(new Date(value));
}

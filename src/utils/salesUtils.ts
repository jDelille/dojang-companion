import type { Invoice, LineItem, Order } from "../types/sales";
import { TAX_RATE } from "./json/salesData";
import { hashString, round2 } from "./formatUtils";

export {
  avatarFor,
  formatSeedDate,
  hashString,
  initials,
  money,
  moneyWhole,
  number,
  round2,
} from "./formatUtils";

export const gatewayRef = (id: string): string =>
  "GW" + Math.abs(hashString(id)).toString(36).toUpperCase().slice(0, 8);

/* ---------- Line-item totals ---------- */

export const lineItemsSubtotal = (items: LineItem[]): number =>
  round2(items.reduce((sum, item) => sum + item.qty * item.price, 0));

export const subtotalOf = (record: Invoice | Order): number => lineItemsSubtotal(record.items);

export const taxOf = (record: Invoice | Order): number => round2(subtotalOf(record) * TAX_RATE);

export const totalOf = (record: Invoice | Order): number =>
  round2(subtotalOf(record) + taxOf(record));

/** Total units across all line items — "N item(s)" in the orders table. */
export const itemCount = (order: Order): number =>
  order.items.reduce((sum, item) => sum + item.qty, 0);

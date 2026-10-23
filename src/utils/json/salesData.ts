import type {
  Coupon,
  CouponStatus,
  Invoice,
  InvoiceStatus,
  Order,
  OrderStatus,
  PayMethod,
  TxnMethod,
  TxnStatus,
  Txn,
} from "../../types/sales";

export const TAX_RATE = 0.0825;

/* ---------- Invoices ---------- */

export const INVOICE_STATUS_BADGE: Record<InvoiceStatus, string> = {
  Paid: "badge-present",
  Unpaid: "badge-late",
  Overdue: "badge-absent",
  Draft: "badge-inactive",
};

export const INVOICE_STATUS_COLOR: Record<InvoiceStatus, string> = {
  Paid: "#16A34A",
  Unpaid: "#D97706",
  Overdue: "#DC2626",
  Draft: "#6B7280",
};

export const INVOICES: Invoice[] = [
  { id: "INV-2026-118", customer: "Ashley Bennett", email: "ashley@email.com", issued: "Jul 14, 2026", due: "Jul 21, 2026", status: "Paid", ts: 118, items: [{ name: "Whey Protein 2 lb", qty: 1, price: 54.99 }, { name: "Shaker Bottle", qty: 1, price: 9.99 }] },
  { id: "INV-2026-117", customer: "Marcus Coleman", email: "marcus@email.com", issued: "Jul 14, 2026", due: "Jul 21, 2026", status: "Unpaid", ts: 117, items: [{ name: "Monthly Membership", qty: 1, price: 49 }] },
  { id: "INV-2026-116", customer: "Tyler Brooks", email: "tyler@email.com", issued: "Jul 12, 2026", due: "Jul 19, 2026", status: "Paid", ts: 116, items: [{ name: "PT Session x5", qty: 1, price: 249 }] },
  { id: "INV-2026-115", customer: "Sofia Delgado", email: "sofia@email.com", issued: "Jul 10, 2026", due: "Jul 17, 2026", status: "Unpaid", ts: 115, items: [{ name: "Pre-Workout 10.5 oz", qty: 2, price: 34.99 }] },
  { id: "INV-2026-114", customer: "Ethan Walsh", email: "ethan@email.com", issued: "Jul 02, 2026", due: "Jul 09, 2026", status: "Overdue", ts: 114, items: [{ name: "Annual Membership", qty: 1, price: 449 }] },
  { id: "INV-2026-113", customer: "Olivia Chen", email: "olivia@email.com", issued: "Jun 28, 2026", due: "Jul 05, 2026", status: "Overdue", ts: 113, items: [{ name: "Quarterly Membership", qty: 1, price: 129 }, { name: "Yoga Mat Premium", qty: 1, price: 29.99 }] },
  { id: "INV-2026-112", customer: "Megan Sullivan", email: "megan@email.com", issued: "Jul 13, 2026", due: "Jul 20, 2026", status: "Paid", ts: 112, items: [{ name: "FitPro Training Tee", qty: 2, price: 24.99 }, { name: "Gym Gloves Pro", qty: 1, price: 19.99 }] },
  { id: "INV-2026-111", customer: "Jordan Blake", email: "jordan@email.com", issued: "Jul 13, 2026", due: "—", status: "Draft", ts: 111, items: [{ name: "Corporate Plan (10 seats)", qty: 1, price: 3990 }] },
  { id: "INV-2026-110", customer: "Natalie Rivera", email: "natalie@email.com", issued: "Jul 12, 2026", due: "Jul 19, 2026", status: "Paid", ts: 110, items: [{ name: "Resistance Band Set", qty: 1, price: 24.99 }] },
  { id: "INV-2026-109", customer: "Jessica Ramirez", email: "jessica@email.com", issued: "Jul 11, 2026", due: "Jul 18, 2026", status: "Unpaid", ts: 109, items: [{ name: "Protein Shake RTD", qty: 4, price: 3.99 }] },
];

/* ---------- Orders ---------- */

export const ORDER_STATUS_BADGE: Record<OrderStatus, string> = {
  Completed: "badge-present",
  Pending: "badge-late",
  Processing: "badge-active",
  Cancelled: "badge-absent",
};

export const PAY_ICON: Record<PayMethod, string> = {
  Cash: "banknote",
  Card: "credit-card",
  "Apple Pay": "smartphone",
  Wallet: "wallet",
};

export const ORDERS: Order[] = [
  { id: "ORD-4821", customer: "Ashley Bennett", items: [{ name: "Whey Protein 2 lb", qty: 1, price: 54.99 }, { name: "Shaker Bottle", qty: 1, price: 12.99 }], pay: "Apple Pay", status: "Completed", date: "Jul 14, 2026, 10:24 AM", ts: 202 },
  { id: "ORD-4820", customer: "Marcus Coleman", items: [{ name: "Monthly Membership", qty: 1, price: 49 }], pay: "Card", status: "Completed", date: "Jul 14, 2026, 09:58 AM", ts: 201 },
  { id: "ORD-4819", customer: "Sofia Delgado", items: [{ name: "Pre-Workout 10.5 oz", qty: 2, price: 34.99 }], pay: "Cash", status: "Pending", date: "Jul 14, 2026, 09:40 AM", ts: 200 },
  { id: "ORD-4818", customer: "Tyler Brooks", items: [{ name: "PT Session x5", qty: 1, price: 259 }], pay: "Card", status: "Processing", date: "Jul 14, 2026, 09:12 AM", ts: 199 },
  { id: "ORD-4817", customer: "Megan Sullivan", items: [{ name: "FitPro Training Tee", qty: 2, price: 24.99 }, { name: "Gym Gloves Pro", qty: 1, price: 24.99 }], pay: "Apple Pay", status: "Completed", date: "Jul 13, 2026, 07:32 PM", ts: 198 },
  { id: "ORD-4816", customer: "Ethan Walsh", items: [{ name: "Resistance Band Set", qty: 1, price: 29.99 }], pay: "Wallet", status: "Cancelled", date: "Jul 13, 2026, 06:05 PM", ts: 197 },
  { id: "ORD-4815", customer: "Olivia Chen", items: [{ name: "Annual Membership", qty: 1, price: 449 }], pay: "Card", status: "Completed", date: "Jul 13, 2026, 04:48 PM", ts: 196 },
  { id: "ORD-4814", customer: "Nathan Miller", items: [{ name: "Creatine", qty: 1, price: 24.99 }, { name: "BCAA Energy", qty: 1, price: 34.99 }], pay: "Apple Pay", status: "Pending", date: "Jul 13, 2026, 02:15 PM", ts: 195 },
  { id: "ORD-4813", customer: "Natalie Rivera", items: [{ name: "Yoga Mat Premium", qty: 1, price: 49.99 }], pay: "Cash", status: "Processing", date: "Jul 13, 2026, 12:30 PM", ts: 194 },
  { id: "ORD-4812", customer: "Jordan Blake", items: [{ name: "Quarterly Membership", qty: 1, price: 129 }], pay: "Card", status: "Completed", date: "Jul 12, 2026, 05:20 PM", ts: 193 },
  { id: "ORD-4811", customer: "Jessica Ramirez", items: [{ name: "Protein Shake RTD", qty: 4, price: 3.49 }], pay: "Wallet", status: "Completed", date: "Jul 12, 2026, 03:10 PM", ts: 192 },
  { id: "ORD-4810", customer: "Cameron Reid", items: [{ name: "Lifting Straps", qty: 1, price: 12.99 }, { name: "Compression Sleeves", qty: 1, price: 19.99 }], pay: "Apple Pay", status: "Cancelled", date: "Jul 12, 2026, 11:02 AM", ts: 191 },
];

/* ---------- Payments ---------- */

export type MethodMeta = { icon: string; cls: string; color: string };

export const METHOD_META: Record<TxnMethod, MethodMeta> = {
  Cash: { icon: "banknote", cls: "ic-green", color: "#4ADE80" },
  Card: { icon: "credit-card", cls: "ic-purple", color: "#818CF8" },
  "Apple Pay": { icon: "smartphone", cls: "ic-gold", color: "#D4AF37" },
  Wallet: { icon: "wallet", cls: "ic-orange", color: "#FB923C" },
  Bank: { icon: "landmark", cls: "ic-cyan", color: "#22D3EE" },
};

/* Object key order drives the Payment Methods mix and settlement lists. */
export const METHOD_ORDER: TxnMethod[] = ["Cash", "Card", "Apple Pay", "Wallet", "Bank"];

export const TXN_STATUS_BADGE: Record<TxnStatus, string> = {
  Success: "badge-present",
  Pending: "badge-late",
  Failed: "badge-absent",
  Refunded: "badge-expired",
};

export const TXNS: Txn[] = [
  { id: "TXN-90231", customer: "Ashley Bennett", method: "Apple Pay", amount: 70.34, status: "Success", date: "Jul 14, 2026, 10:24 AM", today: true, ts: 202 },
  { id: "TXN-90230", customer: "Marcus Coleman", method: "Card", amount: 53.04, status: "Success", date: "Jul 14, 2026, 09:58 AM", today: true, ts: 201 },
  { id: "TXN-90229", customer: "Sofia Delgado", method: "Cash", amount: 75.75, status: "Pending", date: "Jul 14, 2026, 09:40 AM", today: true, ts: 200 },
  { id: "TXN-90228", customer: "Tyler Brooks", method: "Card", amount: 269.54, status: "Success", date: "Jul 14, 2026, 09:12 AM", today: true, ts: 199 },
  { id: "TXN-90227", customer: "Megan Sullivan", method: "Apple Pay", amount: 75.74, status: "Success", date: "Jul 13, 2026, 07:32 PM", today: false, ts: 198 },
  { id: "TXN-90226", customer: "Ethan Walsh", method: "Wallet", amount: 27.05, status: "Refunded", date: "Jul 13, 2026, 06:05 PM", today: false, ts: 197 },
  { id: "TXN-90225", customer: "Olivia Chen", method: "Bank", amount: 486.04, status: "Success", date: "Jul 13, 2026, 04:48 PM", today: false, ts: 196 },
  { id: "TXN-90224", customer: "Nathan Miller", method: "Apple Pay", amount: 64.99, status: "Failed", date: "Jul 13, 2026, 02:15 PM", today: false, ts: 195 },
  { id: "TXN-90223", customer: "Natalie Rivera", method: "Cash", amount: 32.46, status: "Pending", date: "Jul 13, 2026, 12:30 PM", today: false, ts: 194 },
  { id: "TXN-90222", customer: "Jordan Blake", method: "Card", amount: 139.64, status: "Success", date: "Jul 12, 2026, 05:20 PM", today: false, ts: 193 },
  { id: "TXN-90221", customer: "Jessica Ramirez", method: "Wallet", amount: 17.28, status: "Success", date: "Jul 12, 2026, 03:10 PM", today: false, ts: 192 },
  { id: "TXN-90220", customer: "Cameron Reid", method: "Apple Pay", amount: 27.05, status: "Refunded", date: "Jul 12, 2026, 11:02 AM", today: false, ts: 191 },
];

/* ---------- Offers ---------- */

export const COUPON_STATUS_BADGE: Record<CouponStatus, string> = {
  Active: "badge-present",
  Scheduled: "badge-active",
  Expired: "badge-inactive",
};

/** lucide icon name per discount type. */
export const COUPON_TYPE_ICON: Record<Coupon["type"], string> = {
  percent: "percent",
  flat: "dollar-sign",
};

export const COUPONS: Coupon[] = [
  { code: "WELCOME20", title: "New Member Offer", type: "percent", value: 20, used: 148, limit: 300, discountGiven: 2220, expiry: "Aug 31, 2026", status: "Active" },
  { code: "SUMMER25", title: "Summer Sale", type: "percent", value: 25, used: 92, limit: 200, discountGiven: 1840, expiry: "Aug 15, 2026", status: "Active" },
  { code: "FLAT10", title: "Flat $10 Off", type: "flat", value: 10, used: 210, limit: 500, discountGiven: 2100, expiry: "Sep 30, 2026", status: "Active" },
  { code: "PROTEIN15", title: "Supplement Combo", type: "percent", value: 15, used: 64, limit: 150, discountGiven: 510, expiry: "Jul 20, 2026", status: "Active" },
  { code: "PT10", title: "PT Session Deal", type: "percent", value: 10, used: 38, limit: 100, discountGiven: 1900, expiry: "Jul 25, 2026", status: "Active" },
  { code: "THANKS30", title: "Thanksgiving Blowout", type: "percent", value: 30, used: 0, limit: 500, discountGiven: 0, expiry: "Nov 10, 2026", status: "Scheduled" },
  { code: "NEWYEAR40", title: "New Year Blast", type: "percent", value: 40, used: 0, limit: 400, discountGiven: 0, expiry: "Jan 05, 2027", status: "Scheduled" },
  { code: "FLASH15", title: "Flash Weekend", type: "flat", value: 15, used: 500, limit: 500, discountGiven: 7500, expiry: "Jun 30, 2026", status: "Expired" },
  { code: "FALL15", title: "Fall Offer", type: "percent", value: 15, used: 120, limit: 120, discountGiven: 1080, expiry: "Jun 15, 2026", status: "Expired" },
];

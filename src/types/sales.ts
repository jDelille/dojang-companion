/*
   Shared types for the Sales module (invoices, orders, payments, offers).

   The shapes mirror the seed records in tailwind/src/assets/js/{invoices,
   orders,payments,offers}.js so the ported data needs no reshaping.
*/

export type LineItem = {
  name: string;
  qty: number;
  price: number;
};

/* ---------- Invoices ---------- */

export type InvoiceStatus = "Paid" | "Unpaid" | "Overdue" | "Draft";

export type Invoice = {
  id: string;
  customer: string;
  email: string;
  issued: string;
  due: string;
  status: InvoiceStatus;
  ts: number;
  items: LineItem[];
};

/** Values of the invoice sort <select>. */
export type InvoiceSort = "recent" | "amount-desc" | "amount-asc" | "due";

/* ---------- Orders ---------- */

export type OrderStatus = "Completed" | "Pending" | "Processing" | "Cancelled";

/** Payment methods used by orders — Payments adds "Bank" on top of these. */
export type PayMethod = "Cash" | "Card" | "Apple Pay" | "Wallet";

export type Order = {
  id: string;
  customer: string;
  items: LineItem[];
  pay: PayMethod;
  status: OrderStatus;
  date: string;
  ts: number;
};

/** Orders has no "due" option, unlike invoices. */
export type OrderSort = "recent" | "amount-desc" | "amount-asc";

/* ---------- Payments ---------- */

export type TxnStatus = "Success" | "Pending" | "Failed" | "Refunded";

export type TxnMethod = PayMethod | "Bank";

export type Txn = {
  id: string;
  customer: string;
  method: TxnMethod;
  amount: number;
  status: TxnStatus;
  date: string;
  today: boolean;
  ts: number;
};

/* ---------- Offers ---------- */

export type CouponStatus = "Active" | "Scheduled" | "Expired";

export type CouponType = "percent" | "flat";

export type Coupon = {
  code: string;
  title: string;
  type: CouponType;
  value: number;
  used: number;
  limit: number;
  discountGiven: number;
  expiry: string;
  status: CouponStatus;
};

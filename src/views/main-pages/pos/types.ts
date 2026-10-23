import type { LucideIcon } from "lucide-react";

/*
   Shared shapes for the Point of Sale register.

   Ported from the module-level data and `let` state in
   tailwind/src/assets/js/pos.js, which was untyped. Naming follows the
   template's own field names (`cat`, `mid`, `amt`, `q`/`p`/`n`, `rq`) so the
   seeded data can be copied across verbatim and diffed against the source.
*/

export type Product = {
  id: number;
  name: string;
  cat: string;
  price: number;
  stock: number;
  emoji: string;
  rating: number;
  fav: boolean;
};

export type CartItem = {
  id: number;
  name: string;
  price: number;
  emoji: string;
  qty: number;
  fav: boolean;
  gift: boolean;
};

export type Customer = {
  name: string;
  mid: string;
  plan: string;
  tag: string;
};

/*
   One line of a completed sale. `rq` is the quantity already refunded and is
   absent until the first partial refund touches the line — the seeded
   transactions carry no such field.
*/
export type TxLine = {
  n: string;
  q: number;
  p: number;
  rq?: number;
};

export type TxStatus = "Paid" | "Pending" | "Refunded" | "Partially Refunded";

export type Transaction = {
  id: string;
  name: string;
  mid: string;
  plan: string;
  items: string;
  amt: number;
  method: string;
  cashier: string;
  date: string;
  status: TxStatus;
  disc: number;
  notes: string;
  lines: TxLine[];
  /*
     Only sales rung up in this session record their real rates. Seeded rows
     omit both, and rfRates() infers a single net rate from amt vs list value.
  */
  taxRate?: number;
  discRate?: number;
};

export type HeldOrder = {
  ref: string;
  items: CartItem[];
  customer: string;
  total: number;
  when: string;
  draft?: boolean;
  note?: string;
};

export type SyncState = "pending" | "offline" | "synced" | "failed";

export type SyncEntry = {
  ref: string;
  amt: number;
  method: string;
  kind: "Sale" | "Refund";
  at: string;
  state: SyncState;
};

export type DiscountType =
  | "percent"
  | "fixed"
  | "coupon"
  | "employee"
  | "promo"
  | "loyalty";

export type PayMethod =
  | "Cash"
  | "Card"
  | "Apple Pay"
  | "Wallet"
  | "Split"
  | "Gift Card"
  | "Membership Credit"
  | "Store Credit";

/** Methods that draw down a stored balance and so share one panel. */
export type CreditMethod = "Wallet" | "Membership Credit" | "Store Credit";

/*
   Per-method panel state. In the template these values were read back out of
   the DOM on every keystroke because renderPayDetail() rebuilt its own inputs;
   here they are simply the controlled-input state.
*/
export type PayState = {
  Cash: { received: string };
  Card: { card: string; auth: string };
  "Apple Pay": { vpa: string };
  Wallet: { balance: number; use: string };
  Split: { a: string; aAmt: string; b: string; bAmt: string };
  "Gift Card": { code: string; balance: number | null };
  "Membership Credit": { balance: number; use: string };
  "Store Credit": { balance: number; use: string };
};

export type Plan = {
  name: string;
  price: number;
  sub: string;
  emoji: string;
  /** 0 when the plan has no catalogue product behind it. */
  id: number;
};

export type Shortcut = {
  label: string;
  emoji: string;
  id?: number;
  freeze?: boolean;
};

export type QuickActionId =
  | "suspend"
  | "resume"
  | "hold"
  | "new-sale"
  | "save-draft"
  | "order-history"
  | "refund"
  | "discount"
  | "coupon"
  | "cancel-order"
  | "checkin"
  | "register";

export type QuickAction = {
  label: string;
  /*
     The component itself rather than a name: these are the only icons that
     arrive as data, and a direct reference keeps them tree-shakeable without
     widening the shared lucide-icons allowlist.
  */
  Icon: LucideIcon;
  cls: string;
  action: QuickActionId;
};

/** Totals for the live cart. */
export type Totals = {
  sub: number;
  disc: number;
  label: string;
  tax: number;
  total: number;
};

/** Every modal the register can open, keyed as in `#modal-<id>`. */
export type ModalId =
  | "receipt"
  | "sale-complete"
  | "quick-add"
  | "edit-item"
  | "confirm"
  | "payment"
  | "discount"
  | "coupon"
  | "customer"
  | "member"
  | "resume"
  | "refund"
  | "refund-process"
  | "save-draft"
  | "quick-search"
  | "sync"
  | "camera"
  | "quick-actions"
  | "recent-tx";

/*
   Options for the generic confirm dialog, mirroring confirm(opts) in pos.js.
   `onConfirm` is stored rather than called immediately, so the dialog stays a
   pure presentation of whatever queued it.
*/
export type ConfirmOptions = {
  title: string;
  msg: string;
  confirmText?: string;
  danger?: boolean;
  tone?: string;
  icon?: string;
  onConfirm: () => void;
};

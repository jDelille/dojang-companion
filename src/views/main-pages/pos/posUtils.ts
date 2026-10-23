import { PAIRS, POPULAR, PRODUCTS, TAX_RATE } from "./posData";
import type {
  CartItem,
  DiscountType,
  Product,
  Totals,
  Transaction,
} from "./types";

/*
   Pure helpers for the register. Ported from the top of
   tailwind/src/assets/js/pos.js, minus esc() — React escapes text nodes, so
   hand-escaping here would double-encode every ampersand in a product name.
*/

/** Whole-dollar formatting, e.g. "$54.99" → "$55" is NOT wanted: keeps decimals. */
export const cur = (n: number): string =>
  "$" + Number(n).toLocaleString("en-US");

/** Two-decimal money with thousands separators, e.g. "$1,234.50". */
export const money = (n: number): string =>
  "$" + Number(n).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");

/**
 * Stable per-product SKU.
 *
 * Derived rather than stored so the catalogue stays the single source of
 * truth and a new product needs no extra field.
 */
export function skuOf(p: Product | undefined): string {
  if (!p) return "—";
  const words = String(p.name)
    .toUpperCase()
    .replace(/[^A-Z0-9 ]/g, "")
    .split(/\s+/)
    .filter(Boolean);
  const head = (words[0] || "ITEM").slice(0, 4);
  const tail = words.length > 1 ? (words[1] || "").slice(0, 3) : String(p.id);
  return head + "-" + (tail || p.id);
}

/** Simulated EAN-13-ish barcode — deterministic, no check digit. */
export const barcodeOf = (p: Product): string =>
  "890" + String(1000000 + ((p.id * 7919) % 9000000));

/**
 * Resolve a scanned or typed code to a product: SKU, barcode, exact name,
 * then a substring match as the last resort.
 */
export function findByCode(raw: string): Product | null {
  const q = String(raw || "").trim().toUpperCase();
  if (!q) return null;
  return (
    PRODUCTS.find((p) => skuOf(p) === q) ||
    PRODUCTS.find((p) => barcodeOf(p) === q) ||
    PRODUCTS.find((p) => p.name.toUpperCase() === q) ||
    PRODUCTS.find((p) => p.name.toUpperCase().indexOf(q) > -1) ||
    null
  );
}

/** Two-letter avatar initials; "WI" (walk-in) when a name yields none. */
export function initials(n: string): string {
  const p = n.trim().split(/\s+/);
  return (
    ((p[0]?.[0] || "") + (p[1]?.[0] || "")).toUpperCase() || "WI"
  );
}

/** Filled/hollow star row for a 0–5 rating. */
export function starRow(r: number): string {
  const f = Math.round(r);
  return "★★★★★".slice(0, f) + "☆☆☆☆☆".slice(0, 5 - f);
}

/**
 * Discount amount and its short label for the given subtotal.
 *
 * `employee` and `promo` are fixed rates and ignore the entered value, which
 * is why the input is disabled for them.
 */
export function computeDiscount(
  sub: number,
  type: DiscountType,
  raw: string,
): { amt: number; label: string } {
  const num = parseFloat(raw) || 0;
  switch (type) {
    case "percent":
      return { amt: (sub * Math.min(num, 100)) / 100, label: num ? num + "%" : "" };
    case "fixed":
      return { amt: Math.min(num, sub), label: num ? "$" + num : "" };
    case "coupon":
      return raw.trim().toUpperCase() === "FITPRO20"
        ? { amt: sub * 0.2, label: "FITPRO20" }
        : { amt: 0, label: raw ? "Invalid" : "" };
    case "employee":
      return { amt: sub * 0.15, label: "Staff 15%" };
    case "promo":
      return { amt: sub * 0.1, label: "Promo 10%" };
    case "loyalty":
      return {
        amt: Math.min(num || 20, 20, sub),
        label: (num || 20) + " pts",
      };
    default:
      return { amt: 0, label: "" };
  }
}

/** Cart totals. Tax applies to the post-discount amount. */
export function computeTotals(
  cart: CartItem[],
  type: DiscountType,
  raw: string,
): Totals {
  const sub = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const d = computeDiscount(sub, type, raw);
  const aft = sub - d.amt;
  const tax = aft * TAX_RATE;
  return { sub, disc: d.amt, label: d.label, tax, total: aft + tax };
}

export const cartCount = (cart: CartItem[]): number =>
  cart.reduce((s, i) => s + i.qty, 0);

/**
 * "Frequently bought together" ids for the current cart.
 *
 * Scores every partner of every category present, weighting earlier PAIRS
 * entries higher and later cart additions slightly higher, then drops
 * anything already in the cart.
 */
export function suggestionIds(cart: CartItem[]): {
  ids: number[];
  why: string;
} {
  if (!cart.length) return { ids: POPULAR.slice(), why: "Popular right now" };

  const inCart: Record<number, boolean> = {};
  cart.forEach((c) => {
    inCart[c.id] = true;
  });

  const score: Record<number, number> = {};
  cart.forEach((c, idx) => {
    const p = PRODUCTS.find((x) => x.id === c.id);
    if (!p) return;
    (PAIRS[p.cat] || []).forEach((pid, rank) => {
      if (inCart[pid]) return;
      score[pid] = (score[pid] || 0) + (10 - rank) + idx * 0.1;
    });
  });

  const ids = Object.keys(score)
    .map(Number)
    .sort((a, b) => score[b] - score[a])
    .slice(0, 6);

  if (!ids.length) {
    return {
      ids: POPULAR.filter((i) => !inCart[i]).slice(0, 6),
      why: "Popular right now",
    };
  }

  const last = PRODUCTS.find((x) => x.id === cart[cart.length - 1].id);
  return {
    ids,
    why: last ? "Goes with " + last.name : "Frequently bought together",
  };
}

/* ---------- refund bookkeeping ---------- */

/** How much of a line has already gone back across previous refunds. */
export const rfDone = (t: Transaction, i: number): number =>
  t.lines[i]?.rq || 0;

/** How much of a line is still returnable. */
export const rfLeft = (t: Transaction, i: number): number =>
  t.lines[i].q - rfDone(t, i);

/** Whether any line of a sale still has returnable quantity. */
export const rfAnyLeft = (t: Transaction): boolean =>
  t.lines.some((_l, i) => rfLeft(t, i) > 0);

/**
 * Discount and tax rates actually charged on a sale.
 *
 * Sales rung up in this session record both. Seeded rows carry neither, so a
 * single net rate is inferred from `amt` against list value — otherwise a
 * partial refund would return list price rather than what was really paid.
 */
export function rfRates(t: Transaction): { disc: number; tax: number } {
  const list = t.lines.reduce((s, l) => s + l.p * l.q, 0);
  if (typeof t.discRate === "number" && typeof t.taxRate === "number") {
    return { disc: t.discRate, tax: t.taxRate };
  }
  if (!list) return { disc: 0, tax: 0 };
  const net = t.amt / list - 1;
  return net >= 0 ? { disc: 0, tax: net } : { disc: -net, tax: 0 };
}

/** Refund totals for the currently selected quantities. */
export function rfTotals(
  tx: Transaction | null,
  qty: Record<number, number>,
): { base: number; disc: number; tax: number; total: number } {
  if (!tx) return { base: 0, disc: 0, tax: 0, total: 0 };
  const r = rfRates(tx);
  const base = tx.lines.reduce((s, l, i) => s + l.p * (qty[i] || 0), 0);
  const disc = base * r.disc;
  const aft = base - disc;
  const tax = aft * r.tax;
  return { base, disc, tax, total: aft + tax };
}

/* ---------- misc ---------- */

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Timestamp in the same shape as the seeded transaction dates. */
export function saleStamp(): string {
  const d = new Date();
  const mon = MONTHS[d.getMonth()];
  let h = d.getHours();
  const ap = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return (
    d.getDate() +
    " " +
    mon +
    " " +
    d.getFullYear() +
    ", " +
    String(h).padStart(2, "0") +
    ":" +
    String(d.getMinutes()).padStart(2, "0") +
    " " +
    ap
  );
}

/** Trigger a client-side file download from an in-memory string. */
export function download(filename: string, content: string, mime: string): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Quote a CSV cell only when it contains a delimiter, quote or newline. */
export const csvCell = (v: unknown): string =>
  /[",\n]/.test(String(v)) ? '"' + String(v).replace(/"/g, '""') + '"' : String(v);

export const readJSON = <T,>(key: string, fallback: T): T => {
  try {
    const v = JSON.parse(localStorage.getItem(key) || "null");
    return v == null ? fallback : (v as T);
  } catch {
    return fallback;
  }
};

export const writeJSON = (key: string, value: unknown): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* Safari private mode throws on write; a lost queue is better than a crash. */
  }
};

import {
  BadgeCheck,
  BadgePercent,
  Banknote,
  Bookmark,
  CirclePause,
  CirclePlay,
  CreditCard,
  FilePlus,
  Gift,
  History,
  OctagonX,
  Save,
  ScanLine,
  Smartphone,
  Split,
  Store,
  Ticket,
  Undo2,
  UserPlus,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import type {
  Customer,
  DiscountType,
  PayMethod,
  Plan,
  Product,
  QuickAction,
  Shortcut,
  Transaction,
} from "./types";

/*
   Seeded catalogue and demo data, copied from the DATA block in
   tailwind/src/assets/js/pos.js so the React register shows exactly the same
   products, prices, plans and history as the template.
*/

export const PRODUCTS: Product[] = [
  { id: 1, name: "Whey Protein 2 lb", cat: "Protein", price: 54.99, stock: 24, emoji: "🥛", rating: 4.9, fav: true },
  { id: 2, name: "Casein Protein 2 lb", cat: "Protein", price: 49.99, stock: 12, emoji: "🧴", rating: 4.7, fav: false },
  { id: 3, name: "Mass Gainer 4 lb", cat: "Protein", price: 44.99, stock: 8, emoji: "💪", rating: 4.6, fav: false },
  { id: 4, name: "Isolate Protein 2 lb", cat: "Protein", price: 59.99, stock: 16, emoji: "🥤", rating: 4.8, fav: false },
  { id: 5, name: "Pre-Workout BCAA", cat: "Supplements", price: 34.99, stock: 31, emoji: "⚡", rating: 4.8, fav: true },
  { id: 6, name: "Creatine 10.5 oz", cat: "Supplements", price: 24.99, stock: 19, emoji: "🔬", rating: 4.7, fav: false },
  { id: 7, name: "Multivitamin Pack", cat: "Supplements", price: 19.99, stock: 45, emoji: "💊", rating: 4.5, fav: false },
  { id: 8, name: "Fish Oil Omega-3", cat: "Supplements", price: 16.99, stock: 27, emoji: "🐟", rating: 4.6, fav: false },
  { id: 9, name: "Electrolyte Drink", cat: "Drinks", price: 3.49, stock: 88, emoji: "🧃", rating: 4.4, fav: true },
  { id: 10, name: "Protein Bar", cat: "Drinks", price: 2.99, stock: 60, emoji: "🍫", rating: 4.6, fav: false },
  { id: 11, name: "Energy Drink 8.4 oz", cat: "Drinks", price: 2.49, stock: 120, emoji: "🥤", rating: 4.3, fav: false },
  { id: 12, name: "Cold Brew Coffee", cat: "Drinks", price: 4.49, stock: 40, emoji: "☕", rating: 4.7, fav: false },
  { id: 13, name: "Gym Gloves", cat: "Accessories", price: 24.99, stock: 15, emoji: "🥊", rating: 4.5, fav: false },
  { id: 14, name: "Resistance Bands", cat: "Accessories", price: 19.99, stock: 22, emoji: "🏋️", rating: 4.6, fav: false },
  { id: 15, name: "Shaker Bottle", cat: "Accessories", price: 12.99, stock: 30, emoji: "🫗", rating: 4.4, fav: false },
  { id: 16, name: "Lifting Belt", cat: "Accessories", price: 34.99, stock: 9, emoji: "🎽", rating: 4.8, fav: true },
  { id: 17, name: "Monthly Standard", cat: "Memberships", price: 49, stock: 999, emoji: "⭐", rating: 4.7, fav: false },
  { id: 18, name: "Quarterly Gold", cat: "Memberships", price: 129, stock: 999, emoji: "🏆", rating: 4.9, fav: true },
  { id: 19, name: "Annual Premium", cat: "Memberships", price: 449, stock: 999, emoji: "👑", rating: 5.0, fav: false },
  { id: 20, name: "Student Plan", cat: "Memberships", price: 29, stock: 999, emoji: "🎓", rating: 4.5, fav: false },
  { id: 21, name: "PT Session ×1", cat: "Personal Training", price: 59, stock: 999, emoji: "🎯", rating: 4.8, fav: false },
  { id: 22, name: "PT Package ×10", cat: "Personal Training", price: 499, stock: 999, emoji: "💪", rating: 4.9, fav: true },
  { id: 23, name: "Yoga Class ×5", cat: "Personal Training", price: 75, stock: 999, emoji: "🧘", rating: 4.7, fav: false },
  { id: 24, name: "Nutrition Consult", cat: "Personal Training", price: 49, stock: 999, emoji: "🥗", rating: 4.8, fav: false },
  { id: 25, name: "Small Locker / mo", cat: "Locker Rental", price: 10, stock: 40, emoji: "🔒", rating: 4.5, fav: false },
  { id: 26, name: "Large Locker / mo", cat: "Locker Rental", price: 15, stock: 18, emoji: "🗄️", rating: 4.6, fav: false },
  { id: 27, name: "Premium Locker / mo", cat: "Locker Rental", price: 25, stock: 6, emoji: "🔐", rating: 4.9, fav: true },
  { id: 28, name: "Day Pass", cat: "Memberships", price: 20, stock: 999, emoji: "🎟️", rating: 4.4, fav: false },
  { id: 29, name: "Water Bottle 32 oz", cat: "Accessories", price: 9.99, stock: 70, emoji: "💧", rating: 4.5, fav: false },
  { id: 30, name: "Gym Towel", cat: "Accessories", price: 8.99, stock: 55, emoji: "🧻", rating: 4.4, fav: false },
  { id: 31, name: "Wrist Wraps", cat: "Accessories", price: 14.99, stock: 18, emoji: "🤲", rating: 4.7, fav: false },
  { id: 32, name: "Skipping Rope", cat: "Accessories", price: 11.99, stock: 26, emoji: "🪢", rating: 4.5, fav: false },
];

export const CATEGORIES = [
  "All",
  "⭐ Memberships",
  "💊 Supplements",
  "🥛 Protein",
  "🧃 Drinks",
  "🥊 Accessories",
  "💪 Personal Training",
  "🔒 Locker Rental",
];

/*
   The chip labels carry an emoji but the products are filtered by the bare
   category name, so the two are kept side by side rather than stripping the
   emoji back off at match time.
*/
export const CATEGORY_CHIPS: { label: string; value: string }[] = [
  { label: "All", value: "All" },
  { label: "⭐ Memberships", value: "Memberships" },
  { label: "💊 Supplements", value: "Supplements" },
  { label: "🥛 Protein", value: "Protein" },
  { label: "🧃 Drinks", value: "Drinks" },
  { label: "🥊 Accessories", value: "Accessories" },
  { label: "💪 Personal Training", value: "Personal Training" },
  { label: "🔒 Locker Rental", value: "Locker Rental" },
];

/* Plans with id 0 have no catalogue product and are added as named lines. */
export const PLANS: Plan[] = [
  { name: "Monthly", price: 49, sub: "30 days access", emoji: "⭐", id: 17 },
  { name: "Quarterly", price: 129, sub: "3 months + perks", emoji: "🏆", id: 18 },
  { name: "Half-Yearly", price: 239, sub: "6 months saver", emoji: "🥇", id: 0 },
  { name: "Annual", price: 449, sub: "Best value", emoji: "👑", id: 19 },
  { name: "Personal Training", price: 499, sub: "10 sessions", emoji: "💪", id: 22 },
  { name: "Yoga", price: 75, sub: "5 classes", emoji: "🧘", id: 23 },
  { name: "CrossFit", price: 109, sub: "Monthly WOD", emoji: "🤸", id: 0 },
  { name: "Zumba", price: 59, sub: "Dance fitness", emoji: "💃", id: 0 },
  { name: "Swimming", price: 69, sub: "Pool access", emoji: "🏊", id: 0 },
  { name: "Locker", price: 10, sub: "Small / month", emoji: "🔒", id: 25 },
];

export const SHORTCUTS: Shortcut[] = [
  { label: "Membership", emoji: "⭐", id: 17 },
  { label: "PT Session", emoji: "🎯", id: 21 },
  { label: "Day Pass", emoji: "🎟️", id: 28 },
  { label: "Protein", emoji: "🥛", id: 1 },
  { label: "Locker", emoji: "🔒", id: 25 },
  { label: "Water", emoji: "💧", id: 29 },
  { label: "Towel", emoji: "🧻", id: 30 },
  { label: "Renew", emoji: "🔄", id: 19 },
  { label: "Upgrade", emoji: "⬆️", id: 18 },
  { label: "Freeze", emoji: "❄️", freeze: true },
  { label: "Gloves", emoji: "🥊", id: 13 },
  { label: "Shaker", emoji: "🫗", id: 15 },
];

export const QUICK_ACTIONS: QuickAction[] = [
  { label: "Suspend Sale", Icon: CirclePause, cls: "t-orange", action: "suspend" },
  { label: "Resume Sale", Icon: CirclePlay, cls: "t-green", action: "resume" },
  { label: "Hold Bill", Icon: Bookmark, cls: "t-gold", action: "hold" },
  { label: "New Sale", Icon: FilePlus, cls: "t-indigo", action: "new-sale" },
  { label: "Save Draft", Icon: Save, cls: "t-cyan", action: "save-draft" },
  { label: "Order History", Icon: History, cls: "t-gold", action: "order-history" },
  { label: "Refund", Icon: Undo2, cls: "t-red", action: "refund" },
  { label: "Apply Discount", Icon: BadgePercent, cls: "t-gold", action: "discount" },
  { label: "Coupon Code", Icon: Ticket, cls: "t-green", action: "coupon" },
  { label: "Cancel Order", Icon: OctagonX, cls: "t-red", action: "cancel-order" },
  { label: "Member Check-In", Icon: ScanLine, cls: "t-green", action: "checkin" },
  { label: "Register Member", Icon: UserPlus, cls: "t-gold", action: "register" },
];

export const CUSTOMERS: Customer[] = [
  { name: "Ashley Bennett", mid: "M-1001", plan: "Annual Premium", tag: "Premium" },
  { name: "Marcus Coleman", mid: "M-1002", plan: "Annual Premium", tag: "Premium" },
  { name: "Jessica Ramirez", mid: "M-1003", plan: "Quarterly Gold", tag: "Gold" },
  { name: "Brooke Carter", mid: "M-1004", plan: "Student Plan", tag: "Student" },
  { name: "Kevin Barnes", mid: "M-1015", plan: "Quarterly Gold", tag: "Gold" },
  { name: "Walk-in Customer", mid: "—", plan: "None", tag: "Guest" },
];

export const RECENT_TX: Transaction[] = [
  { id: "#INV-2047", name: "Ashley Bennett", mid: "M-1001", plan: "Annual Premium", items: "Whey Protein, Shaker", amt: 67.98, method: "Apple Pay", cashier: "Nathan Reeves", date: "Jul 13, 2026, 04:52 PM", status: "Paid", disc: 0, notes: "Loyalty points added.", lines: [{ n: "Whey Protein 2 lb", q: 1, p: 54.99 }, { n: "Shaker Bottle", q: 1, p: 12.99 }] },
  { id: "#INV-2046", name: "Marcus Coleman", mid: "M-1002", plan: "Annual Premium", items: "Annual Premium", amt: 449, method: "Card", cashier: "Nathan Reeves", date: "Jul 13, 2026, 04:40 PM", status: "Paid", disc: 0, notes: "New annual signup.", lines: [{ n: "Annual Premium", q: 1, p: 449 }] },
  { id: "#INV-2045", name: "Walk-in", mid: "—", plan: "None", items: "Energy Drink ×2", amt: 4.98, method: "Cash", cashier: "Vanessa Cole", date: "Jul 13, 2026, 04:32 PM", status: "Paid", disc: 0, notes: "", lines: [{ n: "Energy Drink 8.4 oz", q: 2, p: 2.49 }] },
  { id: "#INV-2044", name: "Jessica Ramirez", mid: "M-1003", plan: "Quarterly Gold", items: "PT Package ×10", amt: 499, method: "Card", cashier: "Nathan Reeves", date: "Jul 13, 2026, 04:16 PM", status: "Refunded", disc: 0, notes: "Refunded — schedule conflict.", lines: [{ n: "PT Package ×10", q: 1, p: 499 }] },
  { id: "#INV-2043", name: "Brooke Carter", mid: "M-1004", plan: "Student Plan", items: "Creatine, Multivit", amt: 44.98, method: "Apple Pay", cashier: "Vanessa Cole", date: "Jul 13, 2026, 04:03 PM", status: "Paid", disc: 0, notes: "", lines: [{ n: "Creatine 10.5 oz", q: 1, p: 24.99 }, { n: "Multivitamin Pack", q: 1, p: 19.99 }] },
  { id: "#INV-2042", name: "Walk-in", mid: "—", plan: "None", items: "Protein Bar ×3", amt: 8.97, method: "Cash", cashier: "Vanessa Cole", date: "Jul 13, 2026, 03:47 PM", status: "Paid", disc: 0, notes: "", lines: [{ n: "Protein Bar", q: 3, p: 2.99 }] },
  { id: "#INV-2041", name: "Kevin Barnes", mid: "M-1015", plan: "Quarterly Gold", items: "Quarterly Gold", amt: 129, method: "Wallet", cashier: "Nathan Reeves", date: "Jul 13, 2026, 03:29 PM", status: "Pending", disc: 0, notes: "Awaiting wallet confirmation.", lines: [{ n: "Quarterly Gold", q: 1, p: 129 }] },
  { id: "#INV-2040", name: "Isabella Romano", mid: "M-1021", plan: "Monthly Standard", items: "Yoga Class ×5, Towel", amt: 83.99, method: "Apple Pay", cashier: "Vanessa Cole", date: "Jul 13, 2026, 03:11 PM", status: "Paid", disc: 0, notes: "", lines: [{ n: "Yoga Class ×5", q: 1, p: 75 }, { n: "Gym Towel", q: 1, p: 8.99 }] },
  { id: "#INV-2039", name: "Walk-in", mid: "—", plan: "None", items: "Gym Gloves", amt: 24.99, method: "Card", cashier: "Nathan Reeves", date: "Jul 13, 2026, 02:54 PM", status: "Paid", disc: 0, notes: "", lines: [{ n: "Gym Gloves", q: 1, p: 24.99 }] },
  { id: "#INV-2038", name: "Corey Hughes", mid: "M-1030", plan: "Monthly Standard", items: "Monthly Standard", amt: 49, method: "Cash", cashier: "Vanessa Cole", date: "Jul 13, 2026, 02:38 PM", status: "Refunded", disc: 0, notes: "Refunded — duplicate charge.", lines: [{ n: "Monthly Standard", q: 1, p: 49 }] },
];

export const DISC_HINTS: Record<DiscountType, string> = {
  percent: "Percentage off the subtotal.",
  fixed: "Flat $ amount off the subtotal.",
  coupon: "Enter a coupon code (try FITPRO20).",
  employee: "Staff discount — 15% applied automatically.",
  promo: "Seasonal promo — 10% applied automatically.",
  loyalty: "Redeem loyalty points ($1 per point, max 20).",
};

export const DISC_TYPES: { value: DiscountType; label: string }[] = [
  { value: "percent", label: "Percentage" },
  { value: "fixed", label: "Fixed $" },
  { value: "coupon", label: "Coupon" },
  { value: "employee", label: "Employee" },
  { value: "promo", label: "Promo" },
  { value: "loyalty", label: "Loyalty" },
];

/* Fixed 9×9 pattern so the fake QR renders identically every time. */
export const QR_PATTERN = [
  1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1,
  1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 0, 1, 1,
  0, 0, 1, 1, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1, 1, 1, 0, 0, 1, 0, 1, 1, 0, 0,
  1, 1, 1,
];

/*
   "Frequently bought together" — partner products keyed by the category
   already in the cart.
*/
export const PAIRS: Record<string, number[]> = {
  Protein: [15, 9, 6, 5],
  Supplements: [1, 9, 15, 10],
  Drinks: [10, 30, 29, 1],
  Accessories: [29, 30, 9, 1],
  Memberships: [21, 25, 30, 24],
  "Personal Training": [24, 5, 9, 15],
  "Locker Rental": [30, 29, 13, 9],
};

export const POPULAR = [9, 21, 13, 30, 24, 6];

export const SPLIT_METHODS = ["Cash", "Card", "Apple Pay", "Wallet"];

export const GIFT_CARDS: Record<string, number> = {
  "GIFT-25": 25,
  "GIFT-50": 50,
  FITGIFT: 100,
};

export const CARD_OPTIONS = [
  "Visa •••• 4821",
  "Mastercard •••• 7712",
  "New card on terminal",
];

export const PAY_METHODS: {
  value: PayMethod;
  label: string;
  Icon: LucideIcon;
}[] = [
  { value: "Cash", label: "Cash", Icon: Banknote },
  { value: "Card", label: "Card", Icon: CreditCard },
  { value: "Apple Pay", label: "Apple Pay", Icon: Smartphone },
  { value: "Wallet", label: "Wallet", Icon: Wallet },
  { value: "Split", label: "Split", Icon: Split },
  { value: "Gift Card", label: "Gift", Icon: Gift },
  { value: "Membership Credit", label: "M.Credit", Icon: BadgeCheck },
  { value: "Store Credit", label: "Store", Icon: Store },
];

export const REFUND_REASONS = [
  "Customer changed mind",
  "Damaged or defective",
  "Wrong item sold",
  "Expired product",
  "Duplicate charge",
  "Other",
];

export const REFUND_TO = ["Cash", "Card", "Apple Pay", "Wallet", "Store Credit"];

export const TAX_RATE = 0.0825;
export const TX_PER_PAGE = 6;
export const CASHIER = "Nathan Reeves";
export const SOUND_KEY = "nexus-pos-sound";
export const SYNC_KEY = "nexus-pos-queue";
export const SYNC_META_KEY = "nexus-pos-sync-meta";

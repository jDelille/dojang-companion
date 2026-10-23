import { useCallback, useMemo, useRef, useState } from "react";
import usePosSound from "../../../hooks/usePosSound";
import usePosSync from "../../../hooks/usePosSync";
import useToast from "../../../hooks/useToast";
import {
  CASHIER,
  CUSTOMERS,
  GIFT_CARDS,
  PRODUCTS,
  RECENT_TX,
  TAX_RATE,
} from "./posData";
import {
  cartCount,
  computeTotals,
  money,
  rfAnyLeft,
  rfDone,
  rfTotals,
  saleStamp,
} from "./posUtils";
import type {
  CartItem,
  ConfirmOptions,
  Customer,
  DiscountType,
  HeldOrder,
  PayMethod,
  PayState,
  Product,
  Transaction,
  TxStatus,
} from "./types";

/*
   The register's whole state, replacing the module-level `let`s and the
   renderX()/updateX() call graph in tailwind/src/assets/js/pos.js.

   Every `renderCart()` / `updateTotals()` call site in the template
   disappears here: totals and suggestions are derived with useMemo and React
   re-renders whatever depends on them.
*/

const REMOVE_ANIM_MS = 190;

const initialPayState = (): PayState => ({
  Cash: { received: "" },
  Card: { card: "Visa •••• 4821", auth: "" },
  "Apple Pay": { vpa: "" },
  Wallet: { balance: 45, use: "" },
  Split: { a: "Cash", aAmt: "", b: "Card", bAmt: "" },
  "Gift Card": { code: "", balance: null },
  "Membership Credit": { balance: 60, use: "" },
  "Store Credit": { balance: 25, use: "" },
});

export const isCreditMethod = (m: PayMethod): boolean =>
  m === "Wallet" || m === "Membership Credit" || m === "Store Credit";

export function usePosRegister() {
  /* ---------- toast + sound + sync ---------- */
  const { message: toastMessage, visible: toastVisible, showToast } = useToast();
  const { muted, sfx, toggleMuted } = usePosSound();

  const errorBeep = useCallback(() => sfx("error"), [sfx]);
  const sync = usePosSync(showToast, errorBeep);

  /* ---------- catalogue ---------- */
  /*
     Stock is mutable: a refund with "Restock" ticked puts goods back on the
     shelf, and the product grid must show it.
  */
  const [products, setProducts] = useState<Product[]>(() =>
    PRODUCTS.map((p) => ({ ...p })),
  );

  /* ---------- cart + register ---------- */
  const [cart, setCart] = useState<CartItem[]>([]);
  const [heldOrders, setHeldOrders] = useState<HeldOrder[]>([]);
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [customer, setCustomer] = useState<Customer>(CUSTOMERS[0]);
  const [orderNotes, setOrderNotes] = useState("");
  const [invoiceNo, setInvoiceNo] = useState(2048);
  const [paid, setPaid] = useState(false);
  /** Ids mid-removal, so the line can play its exit animation first. */
  const [removing, setRemoving] = useState<number[]>([]);

  /* ---------- discount ---------- */
  const [discountType, setDiscountType] = useState<DiscountType>("percent");
  const [discountValue, setDiscountValue] = useState("");

  /* ---------- payment ---------- */
  const [payMethod, setPayMethod] = useState<PayMethod>("Cash");
  const [payState, setPayState] = useState<PayState>(initialPayState);

  /* ---------- transactions ---------- */
  const [transactions, setTransactions] = useState<Transaction[]>(() =>
    RECENT_TX.map((t) => ({ ...t, lines: t.lines.map((l) => ({ ...l })) })),
  );

  /*
     Catalogue-less lines (plan cards, custom items) get a stable synthetic id.
     The template's old formula (900 + cart.length + price % 97) could collide
     and make two different custom lines share an id.
  */
  const customSeq = useRef(0);
  const nextCustomId = () => 9000 + ++customSeq.current;

  const invoiceId = "#INV-" + invoiceNo;

  /* ---------- derived ---------- */
  const totals = useMemo(
    () => computeTotals(cart, discountType, discountValue),
    [cart, discountType, discountValue],
  );
  const count = useMemo(() => cartCount(cart), [cart]);

  const visibleProducts = useMemo(() => {
    const q = search.toLowerCase();
    let list = products;
    if (category !== "All") list = list.filter((p) => p.cat === category);
    if (q) list = list.filter((p) => p.name.toLowerCase().includes(q));
    return list;
  }, [products, category, search]);

  /* ---------- cart actions ---------- */
  const findCart = useCallback(
    (id: number) => cart.find((c) => c.id === id),
    [cart],
  );

  /*
     `cue` overrides the sound: a scanned item beeps like a scanner rather
     than firing the scan beep and the add chirp on top of each other.
  */
  const addToCart = useCallback(
    (id: number, cue?: "scan") => {
      const p = products.find((x) => x.id === id);
      if (!p) return;
      setCart((prev) => {
        const it = prev.find((c) => c.id === id);
        if (it) return prev.map((c) => (c.id === id ? { ...c, qty: c.qty + 1 } : c));
        showToast(p.name + " added");
        return [
          ...prev,
          {
            id: p.id,
            name: p.name,
            price: p.price,
            emoji: p.emoji,
            qty: 1,
            fav: p.fav,
            gift: false,
          },
        ];
      });
      sfx(cue || "add");
    },
    [products, sfx, showToast],
  );

  /** Adds a priced line with no catalogue product behind it. */
  const addNamed = useCallback(
    (name: string, price: number, emoji?: string) => {
      if (!name || !(price > 0)) {
        sfx("error");
        showToast("That plan has no price set");
        return;
      }
      setCart((prev) => {
        const it = prev.find((c) => c.name === name);
        if (it) return prev.map((c) => (c.name === name ? { ...c, qty: c.qty + 1 } : c));
        return [
          ...prev,
          {
            id: nextCustomId(),
            name,
            price,
            emoji: emoji || "🏷️",
            qty: 1,
            fav: false,
            gift: false,
          },
        ];
      });
      sfx("add");
      showToast(name + " added");
    },
    [sfx, showToast],
  );

  const removeItem = useCallback(
    (id: number, silent?: boolean) => {
      sfx("remove");
      // Let the line play its .removing exit before it leaves the list.
      setRemoving((prev) => [...prev, id]);
      setTimeout(() => {
        setCart((prev) => prev.filter((c) => c.id !== id));
        setRemoving((prev) => prev.filter((r) => r !== id));
        if (!silent) showToast("Item removed");
      }, REMOVE_ANIM_MS);
    },
    [sfx, showToast],
  );

  const setQty = useCallback(
    (id: number, qty: number) => {
      if (qty <= 0) {
        removeItem(id, true);
        return;
      }
      setCart((prev) => prev.map((c) => (c.id === id ? { ...c, qty } : c)));
    },
    [removeItem],
  );

  const changeQty = useCallback(
    (id: number, delta: number) => {
      const it = cart.find((c) => c.id === id);
      if (!it) return;
      /*
         Stepping the last unit off removes the line — let removeItem's own
         sound play instead of stacking a qty-down chirp on top of it.
      */
      if (it.qty + delta > 0) sfx(delta > 0 ? "qty-up" : "qty-down");
      setQty(id, it.qty + delta);
    },
    [cart, setQty, sfx],
  );

  const toggleFav = useCallback((id: number) => {
    setCart((prev) => prev.map((c) => (c.id === id ? { ...c, fav: !c.fav } : c)));
  }, []);

  const toggleGift = useCallback(
    (id: number) => {
      setCart((prev) => {
        const it = prev.find((c) => c.id === id);
        if (it) showToast(!it.gift ? "Marked as gift 🎁" : "Gift removed");
        return prev.map((c) => (c.id === id ? { ...c, gift: !c.gift } : c));
      });
    },
    [showToast],
  );

  const addCustomItem = useCallback((name: string, price: number) => {
    setCart((prev) => [
      ...prev,
      { id: nextCustomId(), name, price, emoji: "🏷️", qty: 1, fav: false, gift: false },
    ]);
  }, []);

  const saveEdit = useCallback(
    (id: number, name: string, price: number, qty: number) => {
      setCart((prev) =>
        prev.map((c) => (c.id === id ? { ...c, name, price, qty } : c)),
      );
    },
    [],
  );

  const clearCart = useCallback(() => {
    setCart([]);
    setPaid(false);
  }, []);

  const newSale = useCallback(() => {
    clearCart();
    setDiscountValue("");
    showToast("New sale started");
  }, [clearCart, showToast]);

  /* ---------- hold / resume / draft ---------- */
  const holdBill = useCallback(() => {
    if (!cart.length) {
      showToast("Nothing to hold");
      return;
    }
    setHeldOrders((prev) => [
      ...prev,
      {
        ref: "#HOLD-" + (2050 + prev.length),
        items: cart.slice(),
        customer: customer.name,
        total: totals.total,
        when: "Just now",
      },
    ]);
    clearCart();
    showToast("Bill held");
  }, [cart, customer.name, totals.total, clearCart, showToast]);

  const saveDraft = useCallback(
    (name: string, note: string) => {
      if (!cart.length) {
        showToast("Nothing to save as a draft");
        return false;
      }
      setHeldOrders((prev) => [
        ...prev,
        {
          ref: name.trim() || customer.name + " — " + cart.length + " items",
          items: cart.slice(),
          customer: customer.name,
          total: totals.total,
          when: "Draft · just now",
          draft: true,
          note: note.trim(),
        },
      ]);
      clearCart();
      showToast("Draft saved — find it under Resume");
      return true;
    },
    [cart, customer.name, totals.total, clearCart, showToast],
  );

  const resumeOrder = useCallback(
    (idx: number) => {
      const h = heldOrders[idx];
      if (!h) return;
      setCart(h.items.slice());
      setHeldOrders((prev) => prev.filter((_, i) => i !== idx));
      showToast("Order " + h.ref + " resumed");
    },
    [heldOrders, showToast],
  );

  /* ---------- payment ---------- */
  const patchPay = useCallback(
    <K extends PayMethod>(method: K, patch: Partial<PayState[K]>) => {
      setPayState((prev) => ({ ...prev, [method]: { ...prev[method], ...patch } }));
    },
    [],
  );

  /** What the receipt / history should record for this sale. */
  const payLabel = useMemo(() => {
    if (payMethod === "Split")
      return "Split · " + payState.Split.a + " + " + payState.Split.b;
    if (payMethod === "Card") return "Card · " + payState.Card.card;
    return payMethod;
  }, [payMethod, payState]);

  /** Gates "Complete Payment" on the active method's own panel. */
  const paymentReady = useCallback((): { ok: boolean; msg?: string } => {
    if (payMethod === "Card") {
      const { auth } = payState.Card;
      if (auth && !/^\d{6}$/.test(auth))
        return { ok: false, msg: "Approval code must be 6 digits" };
    }
    if (payMethod === "Apple Pay") {
      const vpa = payState["Apple Pay"].vpa.trim();
      if (!vpa)
        return { ok: false, msg: "Enter the member’s email for the payment link" };
      /*
         Was a UPI VPA check (user@bank, no dot after the @) — it rejected
         every real email address. Now a plain email shape.
      */
      if (!/^[\w.-]+@[\w-]+\.[a-zA-Z]{2,}$/.test(vpa))
        return { ok: false, msg: "That email address does not look valid" };
    }
    if (isCreditMethod(payMethod)) {
      const s = payState[payMethod as "Wallet"];
      const use = parseFloat(s.use) || 0;
      if (use <= 0) return { ok: false, msg: "Enter how much credit to apply" };
      if (use > s.balance)
        return { ok: false, msg: "Only " + money(s.balance) + " available" };
    }
    if (payMethod === "Gift Card" && payState["Gift Card"].balance == null)
      return { ok: false, msg: "Check a gift card code first" };
    if (payMethod === "Split") {
      const s = payState.Split;
      if (s.a === s.b)
        return { ok: false, msg: "Pick two different methods to split across" };
      const a = parseFloat(s.aAmt) || 0;
      const b = parseFloat(s.bAmt) || 0;
      if (Math.abs(totals.total - a - b) >= 0.5)
        return { ok: false, msg: "Split must add up to " + money(totals.total) };
    }
    return { ok: true };
  }, [payMethod, payState, totals.total]);

  /** Panel-level side actions: terminal, payment link, max credit, gift, even split. */
  const payDetailAction = useCallback(
    (act: "pd-terminal" | "pd-upi" | "pd-max" | "pd-gift" | "pd-even") => {
      if (act === "pd-terminal") {
        const code = String(Math.floor(100000 + Math.random() * 900000));
        patchPay("Card", { auth: code });
        showToast("Terminal approved · code " + code);
      } else if (act === "pd-upi") {
        const vpa = payState["Apple Pay"].vpa.trim();
        if (!vpa) {
          showToast("Enter an email address first");
          return;
        }
        showToast("Payment link sent to " + vpa);
      } else if (act === "pd-max") {
        const s = payState[payMethod as "Wallet"];
        patchPay(payMethod as "Wallet", {
          use: String(Math.min(s.balance, totals.total)),
        });
      } else if (act === "pd-gift") {
        const code = (payState["Gift Card"].code || "").trim().toUpperCase();
        if (!code) {
          showToast("Enter a gift card code");
          return;
        }
        const bal = GIFT_CARDS[code];
        if (bal == null) {
          patchPay("Gift Card", { balance: null });
          showToast("That gift card is not valid");
          return;
        }
        patchPay("Gift Card", { balance: bal });
        showToast("Gift card " + code + " · " + money(bal) + " available");
      } else if (act === "pd-even") {
        const half = Math.round((totals.total / 2) * 100) / 100;
        patchPay("Split", {
          aAmt: String(half),
          bAmt: String(Math.round((totals.total - half) * 100) / 100),
        });
      }
    },
    [patchPay, payMethod, payState, totals.total, showToast],
  );

  /* ---------- completing a sale ---------- */
  const logSale = useCallback(() => {
    const tx: Transaction = {
      id: invoiceId,
      name: customer.name,
      mid: customer.mid,
      plan: customer.plan,
      items: cart.map((i) => i.name).join(", ") || "—",
      amt: Math.round(totals.total),
      method: payMethod,
      cashier: CASHIER,
      date: saleStamp(),
      status: "Paid",
      disc: Math.round(totals.disc),
      notes: orderNotes.trim(),
      taxRate: TAX_RATE,
      discRate: totals.sub > 0 ? totals.disc / totals.sub : 0,
      lines: cart.map((i) => ({ n: i.name, q: i.qty, p: i.price })),
    };
    setTransactions((prev) => [tx, ...prev]);
  }, [cart, customer, invoiceId, orderNotes, payMethod, totals]);

  /**
   * Records the sale, queues it for sync and resets the register.
   * Validation of the tendered amount happens in the payment modal.
   */
  const finalizeSale = useCallback(() => {
    logSale();
    sync.queueSale({
      ref: invoiceId,
      amt: totals.total,
      method: payLabel,
      kind: "Sale",
      at: saleStamp(),
    });
    setPaid(true);
    sfx("success");
    clearCart();
    setInvoiceNo((n) => n + 1);
  }, [logSale, sync, invoiceId, totals.total, payLabel, sfx, clearCart]);

  /* ---------- refunds ---------- */
  const processRefund = useCallback(
    (
      tx: Transaction,
      qty: Record<number, number>,
      opts: { reason: string; to: string; restock: boolean; note: string },
    ) => {
      const t = rfTotals(tx, qty);
      let units = 0;

      setTransactions((prev) =>
        prev.map((row) => {
          if (row.id !== tx.id) return row;
          const lines = row.lines.map((l, i) => {
            const q = qty[i] || 0;
            if (!q) return l;
            units += q;
            return { ...l, rq: rfDone(row, i) + q };
          });
          const next: Transaction = { ...row, lines };
          /*
             Partially refunded sales stay refundable; only mark Refunded once
             nothing is left to return.
          */
          next.status = (rfAnyLeft(next) ? "Partially Refunded" : "Refunded") as TxStatus;
          next.notes =
            (row.notes ? row.notes + " " : "") +
            "Refunded " +
            money(t.total) +
            " (" +
            units +
            " item" +
            (units === 1 ? "" : "s") +
            ") to " +
            opts.to +
            " — " +
            opts.reason +
            "." +
            (opts.note ? " " + opts.note : "");
          return next;
        }),
      );

      if (opts.restock) {
        setProducts((prev) =>
          prev.map((p) => {
            const idx = tx.lines.findIndex((l) => l.n === p.name);
            const q = idx > -1 ? qty[idx] || 0 : 0;
            // Returned goods go back on the shelf.
            return q ? { ...p, stock: p.stock + q } : p;
          }),
        );
      }

      sync.queueRefund({
        ref: tx.id,
        amt: -t.total,
        method: "Refund",
        kind: "Refund",
        at: saleStamp(),
      });
      sfx("success");
      showToast(
        tx.id + " refunded — " + money(t.total) + (opts.restock ? " · restocked" : ""),
      );
    },
    [sync, sfx, showToast],
  );

  /* ---------- generic confirm dialog ---------- */
  const [confirmOpts, setConfirmOpts] = useState<ConfirmOptions | null>(null);
  const askConfirm = useCallback((opts: ConfirmOptions) => setConfirmOpts(opts), []);
  const runConfirm = useCallback(() => {
    confirmOpts?.onConfirm();
    setConfirmOpts(null);
  }, [confirmOpts]);

  const pickCustomer = useCallback(
    (name: string) => {
      const c = CUSTOMERS.find((x) => x.name === name);
      if (!c) return;
      setCustomer(c);
      showToast("Customer: " + c.name);
    },
    [showToast],
  );

  return {
    /* data */
    products,
    visibleProducts,
    cart,
    removing,
    heldOrders,
    transactions,
    customer,
    invoiceId,
    count,
    totals,
    paid,

    /* filters */
    category,
    setCategory,
    search,
    setSearch,

    /* discount */
    discountType,
    setDiscountType,
    discountValue,
    setDiscountValue,

    /* payment */
    payMethod,
    setPayMethod,
    payState,
    patchPay,
    payLabel,
    paymentReady,
    payDetailAction,

    /* notes */
    orderNotes,
    setOrderNotes,

    /* cart actions */
    findCart,
    addToCart,
    addNamed,
    addCustomItem,
    saveEdit,
    setQty,
    changeQty,
    removeItem,
    toggleFav,
    toggleGift,
    clearCart,
    newSale,

    /* register actions */
    holdBill,
    saveDraft,
    resumeOrder,
    finalizeSale,
    processRefund,
    pickCustomer,

    /* confirm */
    confirmOpts,
    askConfirm,
    runConfirm,
    closeConfirm: () => setConfirmOpts(null),

    /* infra */
    toastMessage,
    toastVisible,
    showToast,
    muted,
    sfx,
    toggleMuted,
    sync,
  };
}

export type PosRegister = ReturnType<typeof usePosRegister>;

export default usePosRegister;

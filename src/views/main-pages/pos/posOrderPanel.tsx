import { useState } from "react";
import {
  BadgePercent,
  ChevronDown,
  CircleCheck,
  Pause,
  Pencil,
  Receipt,
  ShoppingCart,
  Trash2,
  X,
} from "lucide-react";
import PosPayDetail from "./posPayDetail";
import { CUSTOMERS, DISC_TYPES, DISC_HINTS, PAY_METHODS, SHORTCUTS } from "./posData";
import { cur, money } from "./posUtils";
import { spawnRipple } from "./ripple";
import type { PosRegister } from "./usePosRegister";
import type { ModalId } from "./types";

/*
   The Current Order panel, ported from the sticky right-hand column of
   tailwind/src/pos.html plus renderCart() / updateTotals() / setDiscType() in
   assets/js/pos.js.

   Everything the template recomputed by hand in updateTotals() is derived
   from `reg.totals` here and re-renders on its own.
*/

const TRAINERS = ["Daniel Foster", "None", "Rachel Morgan", "Andre Jackson"];
const MEMBERSHIP_PLANS = [
  "Annual Premium — $449",
  "No Plan Attached",
  "Monthly Standard — $49",
  "Quarterly Gold — $129",
];

type PosOrderPanelProps = {
  reg: PosRegister;
  onOpenModal: (id: ModalId) => void;
  onEditItem: (id: number) => void;
  onComplete: () => void;
};

const PosOrderPanel = ({
  reg,
  onOpenModal,
  onEditItem,
  onComplete,
}: PosOrderPanelProps) => {
  const [discOpen, setDiscOpen] = useState(true);
  const [bump, setBump] = useState(0);

  const { cart, totals, count, removing } = reg;
  // employee and promo are fixed rates and ignore whatever is typed.
  const valueDisabled =
    reg.discountType === "employee" || reg.discountType === "promo";

  const placeholder =
    reg.discountType === "coupon"
      ? "FITPRO20"
      : reg.discountType === "fixed"
        ? "e.g. 5"
        : reg.discountType === "loyalty"
          ? "e.g. 20"
          : "e.g. 10";

  const addAndBump = (id: number) => {
    reg.addToCart(id);
    setBump((b) => b + 1);
  };

  return (
    <div className="gold-border-card p-4 order-panel">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {/* key restarts the CSS bump animation on every add */}
          <div key={bump} id="cart-icon" className="icon-box w-8! h-8! grad-gold bump">
            <ShoppingCart className="ic-15 t-ink" aria-hidden="true" />
          </div>
          <div>
            <div className="text-sm font-black c-text leading-none">Current Order</div>
            <div className="text-[10px] mt-0.5 t-muted">
              {reg.invoiceId} · <span>{count}</span> items
            </div>
          </div>
        </div>
        <button
          type="button"
          className="btn-ghost ripple px-2.5 py-1.5 text-[11px] flex items-center gap-1"
          onClick={(e) => {
            spawnRipple(e);
            if (!cart.length) {
              reg.showToast("Cart already empty");
              return;
            }
            reg.askConfirm({
              title: "Clear Cart",
              msg: "Remove all items from the current order?",
              confirmText: "Clear Cart",
              danger: true,
              icon: "trash-2",
              onConfirm: () => {
                reg.clearCart();
                reg.showToast("Cart cleared");
              },
            });
          }}
        >
          <Trash2 className="ic-12" aria-hidden="true" />
          Clear
        </button>
      </div>

      <div className="order-scroll">
        <div className="grid grid-cols-2 gap-2 mb-2">
          <div>
            <label className="mini-label mb-1.5 block">Customer</label>
            <select
              className="fp-input text-xs py-2"
              value={reg.customer.name}
              onChange={(e) => reg.pickCustomer(e.target.value)}
            >
              {CUSTOMERS.map((c) => (
                <option key={c.name}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mini-label mb-1.5 block">Trainer</label>
            <select className="fp-input text-xs py-2" defaultValue={TRAINERS[0]}>
              {TRAINERS.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="mb-3">
          <label className="mini-label mb-1.5 block">Membership Plan</label>
          <select className="fp-input text-xs py-2" defaultValue={MEMBERSHIP_PLANS[0]}>
            {MEMBERSHIP_PLANS.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </div>

        <div className="mini-label mb-2 flex items-center justify-between">
          <span>Cart Items</span>
          <span
            className={
              cart.length
                ? "badge-active text-[9px] font-bold px-2 py-0.5 rounded-full"
                : "badge-inactive text-[9px] font-bold px-2 py-0.5 rounded-full"
            }
          >
            {cart.length ? count + " items" : "Empty"}
          </span>
        </div>

        <div className="cart-items">
          {cart.length ? (
            cart.map((item) => (
              <div
                key={item.id}
                className={removing.includes(item.id) ? "cart-line removing" : "cart-line"}
              >
                <div className="cart-thumb">{item.emoji}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold c-text truncate">
                    {item.name}
                    {item.gift ? " 🎁" : ""}
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[11px] font-bold gt">{cur(item.price)}</span>
                    <button
                      type="button"
                      className={`cart-linkbtn cart-fav text-[11px]${item.fav ? " on" : ""}`}
                      title="Favorite"
                      aria-pressed={item.fav}
                      onClick={() => reg.toggleFav(item.id)}
                    >
                      {item.fav ? "★" : "☆"}
                    </button>
                    <button
                      type="button"
                      className={`cart-linkbtn cart-gift text-[10px]${item.gift ? " on" : ""}`}
                      title="Mark as gift"
                      aria-pressed={item.gift}
                      onClick={() => reg.toggleGift(item.id)}
                    >
                      🎁
                    </button>
                    <button
                      type="button"
                      className="cart-linkbtn text-[10px] t-cyan"
                      title="Edit"
                      onClick={() => onEditItem(item.id)}
                    >
                      <Pencil className="ic-11" aria-hidden="true" />
                    </button>
                  </div>
                </div>
                <div className="stepper">
                  <button
                    type="button"
                    className="step-dec"
                    aria-label="Decrease"
                    onClick={() => reg.changeQty(item.id, -1)}
                  >
                    −
                  </button>
                  <input
                    className="step-qty"
                    type="text"
                    inputMode="numeric"
                    aria-label="Quantity"
                    value={item.qty}
                    onChange={(e) => {
                      const v = parseInt(e.target.value.replace(/\D/g, ""), 10);
                      if (!isNaN(v)) reg.setQty(item.id, v);
                    }}
                  />
                  <button
                    type="button"
                    className="step-inc"
                    aria-label="Increase"
                    onClick={() => reg.changeQty(item.id, 1)}
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  className="cart-remove"
                  aria-label="Remove"
                  onClick={() =>
                    reg.askConfirm({
                      title: "Remove Item",
                      msg: "Remove this item from the current order?",
                      confirmText: "Remove",
                      danger: true,
                      icon: "trash-2",
                      onConfirm: () => reg.removeItem(item.id),
                    })
                  }
                >
                  <X className="ic-13" aria-hidden="true" />
                </button>
              </div>
            ))
          ) : (
            <div className="cart-empty">
              <div className="cart-empty-ic pulse-gold">
                <ShoppingCart className="ic-26 t-gold" aria-hidden="true" />
              </div>
              <div className="text-sm font-bold c-text">Ready for your next member</div>
              <div className="text-[11px] mt-1 t-muted">
                Add products or use a quick shortcut below
              </div>
              <div className="flex gap-2 justify-center mt-3">
                <button
                  type="button"
                  className="btn-ghost ripple px-3 py-1.5 text-[11px]"
                  onClick={(e) => {
                    spawnRipple(e);
                    addAndBump(19);
                  }}
                >
                  + Membership
                </button>
                <button
                  type="button"
                  className="btn-ghost ripple px-3 py-1.5 text-[11px]"
                  onClick={(e) => {
                    spawnRipple(e);
                    addAndBump(21);
                  }}
                >
                  + PT Session
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="divider-y" />

        {/* Discount panel */}
        <button
          type="button"
          className="w-full flex items-center justify-between px-1 mb-2"
          onClick={() => setDiscOpen((o) => !o)}
          aria-expanded={discOpen}
        >
          <span className="mini-label flex items-center gap-1.5">
            <BadgePercent className="ic-12 t-gold" aria-hidden="true" />
            Discount &amp; Offers
          </span>
          <ChevronDown
            className="panel-chev ic-14 t-muted"
            style={{ transform: discOpen ? "rotate(0)" : "rotate(-90deg)" }}
            aria-hidden="true"
          />
        </button>
        <div className={discOpen ? "mb-3" : "mb-3 panel-collapsed"}>
          <div className="grid grid-cols-3 gap-1.5 mb-2">
            {DISC_TYPES.map((d) => (
              <button
                key={d.value}
                type="button"
                className={
                  reg.discountType === d.value
                    ? "disc-type cat-btn active text-[10px]! px-2! py-1.5!"
                    : "disc-type cat-btn text-[10px]! px-2! py-1.5!"
                }
                onClick={() => reg.setDiscountType(d.value)}
              >
                {d.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              className="fp-input text-xs py-2 flex-1"
              placeholder={placeholder}
              disabled={valueDisabled}
              value={reg.discountValue}
              onChange={(e) => reg.setDiscountValue(e.target.value)}
            />
            <button
              type="button"
              className="btn-gold ripple px-3 py-2 text-xs"
              onClick={(e) => {
                spawnRipple(e);
                reg.showToast("Discount applied");
              }}
            >
              Apply
            </button>
          </div>
          <div className="text-[10px] mt-1.5 px-1 t-muted">
            {DISC_HINTS[reg.discountType]}
          </div>
        </div>

        {/* Totals */}
        <div className="space-y-1.5 mb-3 rounded-xl p-3 totals-box">
          <div className="flex justify-between text-xs t-muted">
            <span>Original Total</span>
            <span className="t-soft">{money(totals.sub)}</span>
          </div>
          <div className="flex justify-between text-xs t-muted">
            <span>
              Discount{" "}
              <span className="text-[9px] t-gold">
                {totals.label ? "(" + totals.label + ")" : ""}
              </span>
            </span>
            <span className="t-red">-{money(totals.disc)}</span>
          </div>
          <div className="flex justify-between text-xs t-muted">
            <span>Sales Tax (8.25%)</span>
            <span className="t-soft">{money(totals.tax)}</span>
          </div>
          <div className="flex justify-between text-xs t-muted">
            <span>You Save 🎉</span>
            <span className="t-green">{money(totals.disc)}</span>
          </div>
          <div className="flex justify-between font-black text-base bd-t pt-2 mt-1">
            <span className="c-text">Grand Total</span>
            <span className="gt">{money(totals.total)}</span>
          </div>
        </div>

        <label className="mini-label mb-1.5 block">Order Notes</label>
        <textarea
          className="order-notes mb-3"
          placeholder="Add a note for this order (optional)…"
          value={reg.orderNotes}
          onChange={(e) => reg.setOrderNotes(e.target.value)}
        />

        {/* Payment */}
        <label className="mini-label mb-2 block">Payment Method</label>
        <div className="grid grid-cols-4 gap-1.5 mb-2">
          {PAY_METHODS.slice(0, 4).map(({ value, label, Icon }) => (
            <button
              key={value}
              type="button"
              className={reg.payMethod === value ? "pay-btn active" : "pay-btn"}
              onClick={() => reg.setPayMethod(value)}
            >
              <Icon className="ic-15" aria-hidden="true" />
              <span>{label}</span>
            </button>
          ))}
        </div>
        <div className="grid grid-cols-4 gap-1.5 mb-3">
          {PAY_METHODS.slice(4).map(({ value, label, Icon }) => (
            <button
              key={value}
              type="button"
              className={reg.payMethod === value ? "pay-btn active" : "pay-btn"}
              onClick={() => reg.setPayMethod(value)}
            >
              <Icon className="ic-15" aria-hidden="true" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        <PosPayDetail
          payMethod={reg.payMethod}
          payState={reg.payState}
          totals={totals}
          onPatch={reg.patchPay}
          onAction={reg.payDetailAction}
        />

        <div className="flex items-center justify-between text-xs mb-3 px-0.5">
          <div className="flex items-center gap-2">
            <span className="t-muted">Payment Status</span>
            <span
              className={
                reg.paid
                  ? "badge-paid text-[9px] font-bold px-2 py-0.5 rounded-full"
                  : "badge-pending text-[9px] font-bold px-2 py-0.5 rounded-full"
              }
            >
              {reg.paid ? "Paid" : "Pending"}
            </span>
          </div>
          <span className="t-muted">
            🏆 <span className="font-bold t-gold">340 pts</span>
          </span>
        </div>

        <button
          type="button"
          className="btn-gold ripple w-full py-3.5 text-sm flex items-center justify-center gap-2"
          onClick={(e) => {
            spawnRipple(e);
            onComplete();
          }}
        >
          <CircleCheck className="ic-16" aria-hidden="true" />
          <span>Complete Payment — {money(totals.total)}</span>
        </button>
        <div className="flex gap-2 mt-2">
          <button
            type="button"
            className="btn-ghost ripple flex-1 py-2 text-xs flex items-center justify-center gap-1"
            onClick={(e) => {
              spawnRipple(e);
              onOpenModal("receipt");
            }}
          >
            <Receipt className="ic-12" aria-hidden="true" />
            Receipt
          </button>
          <button
            type="button"
            className="btn-ghost ripple flex-1 py-2 text-xs flex items-center justify-center gap-1"
            onClick={(e) => {
              spawnRipple(e);
              reg.holdBill();
            }}
          >
            <Pause className="ic-12" aria-hidden="true" />
            Hold
          </button>
        </div>

        <div className="mt-4">
          <div className="mini-label mb-2 px-1">Quick POS Shortcuts</div>
          <div className="grid grid-cols-4 gap-2">
            {SHORTCUTS.map((s) => (
              <button
                key={s.label}
                type="button"
                className="quick-tile ripple"
                onClick={(e) => {
                  spawnRipple(e);
                  if (s.freeze) reg.showToast("Membership frozen ❄️");
                  else if (s.id) addAndBump(s.id);
                }}
              >
                <span className="quick-emoji">{s.emoji}</span>
                <span className="text-[9.5px] font-semibold t-soft">{s.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PosOrderPanel;

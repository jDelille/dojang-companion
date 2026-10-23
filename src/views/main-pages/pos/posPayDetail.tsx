import { CreditCard, Smartphone } from "lucide-react";
import { CARD_OPTIONS, SPLIT_METHODS } from "./posData";
import { isCreditMethod } from "./usePosRegister";
import { money } from "./posUtils";
import { spawnRipple } from "./ripple";
import type { PayMethod, PayState, Totals } from "./types";

/*
   Method-specific payment panel, ported from renderPayDetail() /
   updatePayHint() in tailwind/src/assets/js/pos.js.

   Every method has its own contextual panel — in an earlier revision of the
   template Cash was the only one with fields and Split just fired a toast.

   The template mirrored every keystroke back into payState because it rebuilt
   these inputs' DOM on each render; here payState simply *is* the controlled
   state, so the mirroring is inherent.
*/

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <label className="mini-label mb-1.5 block">{label}</label>
    {children}
  </div>
);

type PosPayDetailProps = {
  payMethod: PayMethod;
  payState: PayState;
  totals: Totals;
  onPatch: <K extends PayMethod>(m: K, patch: Partial<PayState[K]>) => void;
  onAction: (act: "pd-terminal" | "pd-upi" | "pd-max" | "pd-gift" | "pd-even") => void;
};

const PosPayDetail = ({
  payMethod,
  payState,
  totals,
  onPatch,
  onAction,
}: PosPayDetailProps) => {
  /* ---------- hint line ---------- */
  let hint = "";
  let hintTone = "t-muted";

  if (payMethod === "Cash") {
    hint = "Enter what the member handed over; change is worked out for you.";
  } else if (payMethod === "Card") {
    const { auth } = payState.Card;
    hint = auth
      ? "Approved · code " + auth
      : "Swipe, insert or tap on the terminal, then enter the approval code.";
  } else if (payMethod === "Apple Pay") {
    const { vpa } = payState["Apple Pay"];
    hint = vpa
      ? "Payment link will be sent to " + vpa
      : "Have the member tap to pay on the terminal, or send a payment link to their email.";
  } else if (isCreditMethod(payMethod)) {
    const s = payState[payMethod as "Wallet"];
    const use = Math.max(parseFloat(s.use) || 0, 0);
    if (use > s.balance) {
      hint = "Only " + money(s.balance) + " available on this account.";
      hintTone = "t-red";
    } else if (use > 0) {
      const rest = Math.max(totals.total - use, 0);
      hint =
        rest > 0
          ? money(use) + " from credit · " + money(rest) + " still due."
          : "Credit covers the full bill 🎉";
      hintTone = rest > 0 ? "t-muted" : "t-green";
    } else {
      hint = money(s.balance) + " available on this account.";
    }
  } else if (payMethod === "Gift Card") {
    const { balance } = payState["Gift Card"];
    if (balance == null) {
      hint = "Enter a gift card code and press Check.";
    } else if (balance >= totals.total) {
      hint = money(balance) + " on card — covers the bill.";
      hintTone = "t-green";
    } else {
      hint =
        money(balance) + " on card · " + money(totals.total - balance) + " still due.";
    }
  } else if (payMethod === "Split") {
    const s = payState.Split;
    const a = parseFloat(s.aAmt) || 0;
    const b = parseFloat(s.bAmt) || 0;
    const diff = totals.total - a - b;
    if (s.a === s.b) {
      hint = "Pick two different methods to split across.";
      hintTone = "t-red";
    } else if (Math.abs(diff) < 0.5) {
      hint =
        "Split balances 🎉 " + money(a) + " + " + money(b) + " = " + money(totals.total);
      hintTone = "t-green";
    } else if (diff > 0) {
      hint = money(diff) + " left to allocate.";
    } else {
      hint = money(-diff) + " over the bill total.";
      hintTone = "t-red";
    }
  }

  /* ---------- panel ---------- */
  const cashReceived = parseFloat(payState.Cash.received) || 0;
  const change = Math.max(cashReceived - totals.total, 0);

  return (
    <div id="pay-detail" className="mb-3">
      {payMethod === "Cash" && (
        <div className="grid grid-cols-2 gap-2">
          <Field label="Cash Received">
            <input
              type="number"
              className="fp-input text-xs py-2"
              placeholder="0"
              value={payState.Cash.received}
              onChange={(e) => onPatch("Cash", { received: e.target.value })}
            />
          </Field>
          <Field label="Change Return">
            <div className="fp-input text-xs py-2 font-bold t-green">
              {money(change)}
            </div>
          </Field>
        </div>
      )}

      {payMethod === "Card" && (
        <>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Card">
              <select
                className="fp-input text-xs py-2"
                value={payState.Card.card}
                onChange={(e) => onPatch("Card", { card: e.target.value })}
              >
                {CARD_OPTIONS.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field label="Approval Code">
              <input
                className="fp-input text-xs py-2"
                placeholder="6 digits"
                inputMode="numeric"
                maxLength={6}
                value={payState.Card.auth}
                onChange={(e) =>
                  onPatch("Card", { auth: e.target.value.replace(/\D/g, "") })
                }
              />
            </Field>
          </div>
          <button
            type="button"
            className="btn-ghost ripple w-full py-2 text-[11px] mt-2 flex items-center justify-center gap-1"
            onClick={(e) => {
              spawnRipple(e);
              onAction("pd-terminal");
            }}
          >
            <CreditCard className="ic-12" aria-hidden="true" />
            Send to Terminal
          </button>
        </>
      )}

      {payMethod === "Apple Pay" && (
        <>
          <Field label="Send payment link to">
            <input
              className="fp-input text-xs py-2"
              placeholder="member@email.com"
              autoComplete="off"
              value={payState["Apple Pay"].vpa}
              onChange={(e) => onPatch("Apple Pay", { vpa: e.target.value })}
            />
          </Field>
          <button
            type="button"
            className="btn-ghost ripple w-full py-2 text-[11px] mt-2 flex items-center justify-center gap-1"
            onClick={(e) => {
              spawnRipple(e);
              onAction("pd-upi");
            }}
          >
            <Smartphone className="ic-12" aria-hidden="true" />
            Send Payment Request
          </button>
        </>
      )}

      {isCreditMethod(payMethod) && (
        <>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Available">
              <div className="fp-input text-xs py-2 font-bold t-green">
                {money(payState[payMethod as "Wallet"].balance)}
              </div>
            </Field>
            <Field label="Apply">
              <input
                type="number"
                className="fp-input text-xs py-2"
                placeholder="0"
                value={payState[payMethod as "Wallet"].use}
                onChange={(e) =>
                  onPatch(payMethod as "Wallet", { use: e.target.value })
                }
              />
            </Field>
          </div>
          <button
            type="button"
            className="btn-ghost ripple w-full py-2 text-[11px] mt-2"
            onClick={(e) => {
              spawnRipple(e);
              onAction("pd-max");
            }}
          >
            Apply maximum
          </button>
        </>
      )}

      {payMethod === "Gift Card" && (
        <>
          <label className="mini-label mb-1.5 block">Gift Card Code</label>
          <div className="flex gap-2">
            <input
              className="fp-input text-xs py-2 flex-1 uppercase"
              placeholder="GIFT-25"
              autoComplete="off"
              value={payState["Gift Card"].code}
              onChange={(e) =>
                // A new code invalidates the previously checked balance.
                onPatch("Gift Card", { code: e.target.value, balance: null })
              }
            />
            <button
              type="button"
              className="btn-gold ripple px-3 py-2 text-xs"
              onClick={(e) => {
                spawnRipple(e);
                onAction("pd-gift");
              }}
            >
              Check
            </button>
          </div>
        </>
      )}

      {payMethod === "Split" && (
        <>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <Field label="Method A">
              <select
                className="fp-input text-xs py-2"
                value={payState.Split.a}
                onChange={(e) => onPatch("Split", { a: e.target.value })}
              >
                {SPLIT_METHODS.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </Field>
            <Field label="Amount A">
              <input
                type="number"
                className="fp-input text-xs py-2"
                placeholder="0"
                value={payState.Split.aAmt}
                onChange={(e) => onPatch("Split", { aAmt: e.target.value })}
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Method B">
              <select
                className="fp-input text-xs py-2"
                value={payState.Split.b}
                onChange={(e) => onPatch("Split", { b: e.target.value })}
              >
                {SPLIT_METHODS.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </Field>
            <Field label="Amount B">
              <input
                type="number"
                className="fp-input text-xs py-2"
                placeholder="0"
                value={payState.Split.bAmt}
                onChange={(e) => onPatch("Split", { bAmt: e.target.value })}
              />
            </Field>
          </div>
          <button
            type="button"
            className="btn-ghost ripple w-full py-2 text-[11px] mt-2"
            onClick={(e) => {
              spawnRipple(e);
              onAction("pd-even");
            }}
          >
            Split evenly
          </button>
        </>
      )}

      <div className={`text-[10px] mt-1.5 px-1 ${hintTone}`}>{hint}</div>
    </div>
  );
};

export default PosPayDetail;

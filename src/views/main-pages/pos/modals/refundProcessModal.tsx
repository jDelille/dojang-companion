import { useMemo, useState } from "react";
import { Check, X } from "lucide-react";
import PosModal from "../posModal";
import { PRODUCTS, REFUND_REASONS, REFUND_TO } from "../posData";
import { money, rfDone, rfLeft, rfTotals, skuOf } from "../posUtils";
import { spawnRipple } from "../ripple";
import type { Transaction } from "../types";

/*
   Process Refund — line level, ported from #modal-refund-process,
   renderRefundRows(), rfStep() and processRefund() in tailwind/src/pos.html
   and assets/js/pos.js.

   A sale can be refunded across several visits, so each line tracks how much
   has already gone back (`rq`) and only the remainder is returnable. Opening
   defaults to a full refund of whatever is still returnable — the common case.
*/

const EPSILON = 0.005;

type RefundProcessModalProps = {
  tx: Transaction | null;
  onClose: () => void;
  onProcess: (
    tx: Transaction,
    qty: Record<number, number>,
    opts: { reason: string; to: string; restock: boolean; note: string },
  ) => void;
  onStep: (delta: number) => void;
  onError: (msg: string) => void;
};

const RefundProcessModal = ({
  tx,
  onClose,
  onProcess,
  onStep,
  onError,
}: RefundProcessModalProps) => {
  /*
     Seeded at mount — the caller keys this modal per transaction, so a
     different sale arrives as a fresh mount rather than a reset.

     Defaults to a full refund of whatever is still returnable.
  */
  const [qty, setQty] = useState<Record<number, number>>(() => {
    const next: Record<number, number> = {};
    tx?.lines.forEach((_l, i) => {
      next[i] = rfLeft(tx, i);
    });
    return next;
  });
  const [reason, setReason] = useState("");
  const [reasonBad, setReasonBad] = useState(false);
  // Card and Apple Pay refund to source; everything else defaults to cash.
  const [to, setTo] = useState(
    tx?.method === "Card" || tx?.method === "Apple Pay" ? tx.method : "Cash",
  );
  const [restock, setRestock] = useState(true);
  const [note, setNote] = useState("");

  const totals = useMemo(() => rfTotals(tx, qty), [tx, qty]);

  const step = (i: number, delta: number) => {
    if (!tx) return;
    const left = rfLeft(tx, i);
    const next = Math.min(Math.max((qty[i] || 0) + delta, 0), left);
    if (next === qty[i]) return;
    setQty((prev) => ({ ...prev, [i]: next }));
    onStep(delta);
  };

  const submit = () => {
    if (!tx) return;
    if (totals.total < EPSILON) {
      onError("Select at least one item to refund");
      return;
    }
    if (!reason) {
      setReasonBad(true);
      onError("Choose a refund reason");
      return;
    }
    onProcess(tx, qty, { reason, to, restock, note: note.trim() });
  };

  return (
    <PosModal
      open={!!tx}
      onClose={onClose}
      boxClassName="modal-wide"
      head={
        <div className="modal-head">
          <div>
            <h3 className="modal-title">Process Refund — {tx?.id ?? "—"}</h3>
            <div className="text-[12px] t-muted mt-0.5">
              Pick the lines and quantities being returned. Defaults to a full
              refund.
            </div>
          </div>
          <button
            type="button"
            className="modal-x"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="ic-15" aria-hidden="true" />
          </button>
        </div>
      }
    >
      <div className="rf-grid">
        <div className="rf-lines">
          <div className="rf-head">
            <span>Item</span>
            <span className="text-center">Refund Qty</span>
            <span className="text-right">Unit Price</span>
            <span className="text-right">Line Total</span>
          </div>
          <div className="rf-rows">
            {tx?.lines.map((l, i) => {
              const left = rfLeft(tx, i);
              const q = qty[i] || 0;
              const done = rfDone(tx, i);
              const product = PRODUCTS.find((x) => x.name === l.n);
              return (
                <div key={l.n + i} className={left ? "rf-row" : "rf-row is-spent"}>
                  <div className="min-w-0">
                    <div className="text-[13px] font-bold c-text truncate">{l.n}</div>
                    <div className="text-[10px] t-dim mt-0.5">
                      {skuOf(product)} ·{" "}
                      {left ? `Up to ${left} returnable` : "Already refunded"}
                      {done && left ? ` · ${done} refunded earlier` : ""}
                    </div>
                  </div>
                  <div className="rf-step">
                    <button
                      type="button"
                      className="rf-step-btn"
                      aria-label="Decrease refund quantity"
                      disabled={q <= 0}
                      onClick={() => step(i, -1)}
                    >
                      −
                    </button>
                    <span className="rf-step-v">{q}</span>
                    <button
                      type="button"
                      className="rf-step-btn"
                      aria-label="Increase refund quantity"
                      disabled={q >= left}
                      onClick={() => step(i, 1)}
                    >
                      +
                    </button>
                  </div>
                  <div className="text-right text-[12px] t-soft">{money(l.p)}</div>
                  <div className="text-right text-[12px] font-bold c-text">
                    {money(l.p * q)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rf-side">
          <label className="mini-label" htmlFor="rf-reason">
            Reason <span className="t-red">*</span>
          </label>
          <select
            id="rf-reason"
            className={
              reasonBad
                ? "fp-input py-2.5 text-sm mb-3 invalid"
                : "fp-input py-2.5 text-sm mb-3"
            }
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              setReasonBad(false);
            }}
          >
            <option value="">Select a reason…</option>
            {REFUND_REASONS.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>

          <label className="mini-label" htmlFor="rf-to">
            Refund To
          </label>
          <select
            id="rf-to"
            className="fp-input py-2.5 text-sm mb-3"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          >
            {REFUND_TO.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>

          <label className="rf-check">
            <input
              type="checkbox"
              checked={restock}
              onChange={(e) => setRestock(e.target.checked)}
            />
            <span>Restock these items</span>
          </label>

          <label className="mini-label mt-3" htmlFor="rf-notes">
            Notes
          </label>
          <textarea
            id="rf-notes"
            className="fp-input py-2 text-xs rf-notes"
            placeholder="Anything the next cashier should know about this refund…"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />

          <div className="rf-totals">
            <div className="rf-t-row">
              <span>Subtotal</span>
              <span>{money(totals.base)}</span>
            </div>
            <div className={totals.disc < EPSILON ? "rf-t-row hidden" : "rf-t-row"}>
              <span>Discount</span>
              <span className="t-red">-{money(totals.disc)}</span>
            </div>
            <div className="rf-t-row">
              <span>Tax</span>
              <span>{money(totals.tax)}</span>
            </div>
            <div className="rf-t-row rf-t-grand">
              <span>Refund Total</span>
              <span className="gt">{money(totals.total)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="rf-foot">
        <button
          type="button"
          className="btn-ghost ripple px-4 py-2.5 text-sm"
          onClick={onClose}
        >
          Cancel
        </button>
        <button
          type="button"
          className="btn-gold ripple px-5 py-2.5 text-sm flex items-center gap-2"
          disabled={totals.total < EPSILON}
          onClick={(e) => {
            spawnRipple(e);
            submit();
          }}
        >
          <Check className="ic-14" aria-hidden="true" />
          Process Refund
        </button>
      </div>
    </PosModal>
  );
};

export default RefundProcessModal;

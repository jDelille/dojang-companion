import { useEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import PosModal from "../posModal";
import { cur, initials, rfAnyLeft } from "../posUtils";
import type { Transaction } from "../types";

/*
   Refund a Sale — the picker, ported from #modal-refund / renderRefundList()
   in tailwind/src/pos.html and assets/js/pos.js.

   Partially refunded sales still have returnable lines, so they belong in
   this list too; filtering to 'Paid' alone would strand them.
*/

const FOCUS_DELAY = 60;

type RefundModalProps = {
  open: boolean;
  onClose: () => void;
  transactions: Transaction[];
  onPick: (tx: Transaction) => void;
};

const RefundModal = ({
  open,
  onClose,
  transactions,
  onPick,
}: RefundModalProps) => {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus only; the caller keys this modal so the query resets by remounting.
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => inputRef.current?.focus(), FOCUS_DELAY);
    return () => clearTimeout(t);
  }, [open]);

  const list = useMemo(() => {
    const term = query.trim().toLowerCase();
    const base = transactions.filter(
      (t) => t.status !== "Refunded" && t.status !== "Pending" && rfAnyLeft(t),
    );
    if (!term) return base;
    return base.filter(
      (t) =>
        t.id.toLowerCase().includes(term) ||
        t.name.toLowerCase().includes(term) ||
        String(t.items).toLowerCase().includes(term),
    );
  }, [query, transactions]);

  return (
    <PosModal
      open={open}
      onClose={onClose}
      title="Refund a Sale"
      boxClassName="modal-sm2"
    >
      <div className="text-[12px] t-muted mb-3">
        Scan the receipt or type the sale number — recent sales show by default.
      </div>
      <div className="relative mb-3">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 ic-14 t-dim"
          aria-hidden="true"
        />
        <input
          ref={inputRef}
          type="text"
          className="fp-input pl-9 py-2.5 text-sm"
          placeholder="Sale number, customer name, or scan…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <div className="pick-scroll">
        {list.length ? (
          list.map((t) => (
            <button
              key={t.id}
              type="button"
              className="pick-row"
              onClick={() => onPick(t)}
            >
              <div className="pick-av">{initials(t.name)}</div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-bold c-text">
                  {t.id} · {t.name}
                </div>
                <div className="text-[11px] t-muted truncate">
                  {t.items} · {t.date}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-black gt">{cur(t.amt)}</div>
                {t.status === "Partially Refunded" && (
                  <div className="text-[9px] t-orange font-bold">Part refunded</div>
                )}
              </div>
            </button>
          ))
        ) : (
          <div className="text-center py-8 t-dim text-sm">
            {query.trim()
              ? `No sale matches “${query}”`
              : "No refundable sales"}
          </div>
        )}
      </div>
    </PosModal>
  );
};

export default RefundModal;

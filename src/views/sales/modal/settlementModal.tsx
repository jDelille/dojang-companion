import { useEffect } from "react";
import { Landmark, X } from "lucide-react";
import { METHOD_META } from "../../../utils/json/salesData";
import { money } from "../../../utils/salesUtils";
import METHOD_ICON from "../methodIcon";
import type { MethodTotal } from "../usePayments";
import DialogEyebrow from "@/components/common/DialogEyebrow";

/*
   Settlements — ported from #modal-settle in tailwind/src/payments.html and
   openSettle() in assets/js/payments.js.

   Raw markup rather than components/common/Modal: the header carries a
   subtitle line under the title.
*/

type SettlementModalProps = {
  open: boolean;
  onClose: () => void;
  total: number;
  rows: MethodTotal[];
  onSettle: () => void;
};

const SettlementModal = ({ open, onClose, total, rows, onSettle }: SettlementModalProps) => {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  return (
    <div
      className={open ? "modal-overlay open" : "modal-overlay"}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-hidden={!open}
    >
      <div className="modal-box glass modal-w-480">
        <div className="flex items-center justify-between mb-4">
          <div>
            <DialogEyebrow />
            <h3 className="text-base font-black c-text">Settlements</h3>
            <div className="text-[11px] c-dim mt-0.5">Today&apos;s payout by method</div>
          </div>
          <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
        <div className="gold-border-card p-4 mb-4 text-center">
          <div className="text-[10px] c-dim2 font-black uppercase tracking-wider">
            Net Payout to Bank
          </div>
          <div className="text-3xl font-black gt mt-1">{money(total)}</div>
          <div className="text-[11px] c-dim mt-1">Settles to Chase ••4821 by 9:00 PM</div>
        </div>
        <div className="space-y-2.5 mb-4">
          {rows.map((row) => {
            const meta = METHOD_META[row.method];
            const Icon = METHOD_ICON[row.method];
            return (
              <div
                key={row.method}
                className="flex items-center gap-3 p-2.5 rounded-xl"
                style={{ background: "var(--card2)", border: "1px solid var(--border)" }}
              >
                <div className={`pay-method ${meta.cls}`} style={{ width: "32px", height: "32px" }}>
                  <Icon
                    className="w-[15px] h-[15px] shrink-0"
                    style={{ color: meta.color }}
                    aria-hidden="true"
                  />
                </div>
                <div className="flex-1">
                  <div className="text-[13px] font-semibold c-text">{row.method}</div>
                  <div className="text-[11px] c-dim">{row.count} transactions</div>
                </div>
                <div className="text-[13px] font-black c-text">{money(row.amount)}</div>
              </div>
            );
          })}
        </div>
        <button
          type="button"
          className="btn-gold w-full py-2.5 text-sm flex items-center justify-center gap-2"
          onClick={onSettle}
        >
          <Landmark className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
          Initiate Settlement
        </button>
      </div>
    </div>
  );
};

export default SettlementModal;

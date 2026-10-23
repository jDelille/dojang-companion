import { useEffect } from "react";
import { FileText, Printer, Send, X } from "lucide-react";
import type { RenewalMember } from "../../../types/renewals";
import { RENEWAL_TAX_RATE } from "../../../utils/json/renewalsData";
import { moneyWhole } from "../../../utils/formatUtils";

/*
   Renewal Invoice — ported from #modal-invoice in tailwind/src/renewals.html
   and openInvoice() in assets/js/renewals.js.

   The invoice number is 1000 + the member's id, and tax is rounded to whole
   dollars before being added, exactly as the template computed it.
*/

type RenewalInvoiceModalProps = {
  member: RenewalMember | null;
  onClose: () => void;
  onSend: () => void;
};

const RenewalInvoiceModal = ({ member, onClose, onSend }: RenewalInvoiceModalProps) => {
  const open = member !== null;

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

  const subtotal = member?.value ?? 0;
  const tax = Math.round(subtotal * RENEWAL_TAX_RATE);

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
      <div className="modal-box glass modal-w-460">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="icon-box ic-gold ic-38">
              <FileText className="w-[17px] h-[17px] c-gold shrink-0" aria-hidden="true" />
            </div>
            <h3 className="text-base font-black c-text">Renewal Invoice</h3>
          </div>
          <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
        <div className="inv-sheet mb-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-sm font-black c-text">Dreams GYM</div>
              <div className="text-[11px] c-dim">Austin HQ</div>
            </div>
            <div className="text-right">
              <div className="text-xs font-bold gt">
                #INV-{member ? 1000 + member.id : "0000"}
              </div>
              <div className="text-[11px] c-dim">2026-07-14</div>
            </div>
          </div>
          <div className="inv-row">
            <span className="c-dim">Billed To</span>
            <span className="font-bold c-text">{member?.name ?? "—"}</span>
          </div>
          <div className="inv-row">
            <span className="c-dim">Plan</span>
            <span className="c-text">{member?.plan ?? "—"}</span>
          </div>
          <div className="inv-row">
            <span className="c-dim">Subtotal</span>
            <span className="c-text">{moneyWhole(subtotal)}</span>
          </div>
          <div className="inv-row">
            <span className="c-dim">Sales Tax ({(RENEWAL_TAX_RATE * 100).toFixed(2)}%)</span>
            <span className="c-text">{moneyWhole(tax)}</span>
          </div>
          <div className="inv-row inv-total">
            <span className="font-black c-text">Total</span>
            <span className="text-lg font-black gt">{moneyWhole(subtotal + tax)}</span>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            className="btn-ghost flex-1 py-2.5 text-sm flex items-center justify-center gap-1.5"
            onClick={() => window.print()}
          >
            <Printer className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            Print
          </button>
          <button
            type="button"
            className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-1.5"
            onClick={onSend}
          >
            <Send className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default RenewalInvoiceModal;

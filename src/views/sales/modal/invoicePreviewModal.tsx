import { useEffect } from "react";
import { Dumbbell, Printer, Send, X } from "lucide-react";
import type { Invoice } from "../../../types/sales";
import { INVOICE_STATUS_COLOR, TAX_RATE } from "../../../utils/json/salesData";
import { money, round2, subtotalOf, taxOf } from "../../../utils/salesUtils";

/*
   Invoice Preview — ported from #modal-invoice in tailwind/src/invoices.html
   and openInvoice() in assets/js/invoices.js.

   This modal is not built on components/common/Modal because the printable
   sheet needs the `no-print` header/footer split, which that component's
   fixed title row does not express.
*/

type InvoicePreviewModalProps = {
  invoice: Invoice | null;
  onClose: () => void;
  onSend: (invoice: Invoice) => void;
};

const InvoicePreviewModal = ({ invoice, onClose, onSend }: InvoicePreviewModalProps) => {
  const open = invoice !== null;

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

  const subtotal = invoice ? subtotalOf(invoice) : 0;
  const tax = invoice ? taxOf(invoice) : 0;

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
      <div className="modal-box glass modal-w-600">
        <div className="flex items-center justify-between mb-4 no-print">
          <h3 className="text-base font-black c-text">Invoice Preview</h3>
          <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>

        <div className="invoice-sheet" id="invoice-sheet">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className="instyle-19">
                <Dumbbell className="size-px-20 c-dark" aria-hidden="true" />
              </div>
              <div>
                <div className="instyle-20">Dreams GYM</div>
                <div className="instyle-21">ELITE MANAGEMENT</div>
              </div>
            </div>
            <div className="text-right">
              <div className="instyle-22">INVOICE</div>
              <div className="instyle-23">{invoice?.id ?? "—"}</div>
            </div>
          </div>

          <div className="instyle-24" />

          {/* Bill to */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="instyle-25">Bill To</div>
              <div className="instyle-26">{invoice?.customer ?? "—"}</div>
              <div className="instyle-27">{invoice?.email ?? "—"}</div>
            </div>
            <div className="text-right">
              <div className="instyle-27">
                Issued: <span className="instyle-28">{invoice?.issued ?? "—"}</span>
              </div>
              <div className="instyle-27">
                Due: <span className="instyle-28">{invoice?.due ?? "—"}</span>
              </div>
              <div className="instyle-29">
                {invoice && (
                  <span
                    style={{
                      display: "inline-block",
                      fontSize: "10px",
                      fontWeight: 800,
                      textTransform: "uppercase",
                      letterSpacing: ".06em",
                      padding: "3px 10px",
                      borderRadius: "99px",
                      color: "#fff",
                      background: INVOICE_STATUS_COLOR[invoice.status],
                    }}
                  >
                    {invoice.status}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Line items */}
          <table className="inv-tbl">
            <thead>
              <tr>
                <th>Description</th>
                <th className="num">Qty</th>
                <th className="num">Rate</th>
                <th className="num">Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoice?.items.map((item, index) => (
                <tr key={`${item.name}-${index}`}>
                  <td>{item.name}</td>
                  <td className="num">{item.qty}</td>
                  <td className="num">{money(item.price)}</td>
                  <td className="num">{money(item.qty * item.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="instyle-30">
            <div className="instyle-31">
              <div className="instyle-32">
                <span>Subtotal</span>
                <span>{money(subtotal)}</span>
              </div>
              <div className="instyle-32">
                <span>Sales Tax ({(TAX_RATE * 100).toFixed(2)}%)</span>
                <span>{money(tax)}</span>
              </div>
              <div className="instyle-33">
                <span>Total</span>
                <span>{money(round2(subtotal + tax))}</span>
              </div>
            </div>
          </div>

          <div className="instyle-34">
            Thank you for choosing Dreams GYM · This is a computer-generated invoice.
          </div>
        </div>

        <div className="flex gap-3 mt-5 no-print">
          <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
            Close
          </button>
          <button
            type="button"
            className="btn-ghost flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
            onClick={() => invoice && onSend(invoice)}
          >
            <Send className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            Send
          </button>
          <button
            type="button"
            className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
            onClick={() => window.print()}
          >
            <Printer className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            Print / PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoicePreviewModal;

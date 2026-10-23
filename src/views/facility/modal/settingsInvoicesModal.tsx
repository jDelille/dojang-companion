import { CheckCircle2, Download, RotateCcw, X } from "lucide-react";
import { INVOICES, fmtDate, inr } from "../../../utils/json/settingsData";

/*
   Invoices — ported from #modal-invoices in tailwind/src/settings.html and
   openInvoices() in assets/js/settings.js.
*/

type SettingsInvoicesModalProps = {
  open: boolean;
  onClose: () => void;
  onDownload: (id: string) => void;
  onExportAll: (count: number) => void;
};

const SettingsInvoicesModal = ({
  open,
  onClose,
  onDownload,
  onExportAll,
}: SettingsInvoicesModalProps) => (
  <div
    className={open ? "modal-overlay open" : "modal-overlay"}
    onClick={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}
    role="dialog"
    aria-modal="true"
    aria-hidden={!open}
  >
    <div className="modal-box glass modal-w-560">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-black c-text">Invoices</h3>
        <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
          <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        </button>
      </div>
      <div className="key-scroll mb-5">
        {INVOICES.map((v) => {
          const paid = v.status === "Paid";
          return (
            <div key={v.id} className="data-row">
              <div className={`icon-box ${paid ? "ic-green" : "ic-orange"}`}>
                {paid ? (
                  <CheckCircle2 className="w-[16px] h-[16px] c-green shrink-0" aria-hidden="true" />
                ) : (
                  <RotateCcw className="w-[16px] h-[16px] c-orange shrink-0" aria-hidden="true" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="dr-t">{v.id}</div>
                <div className="dr-s">{fmtDate(v.date) + " · " + v.status}</div>
              </div>
              <div className="text-[13px] font-bold c-text">{inr(v.amount)}</div>
              <button
                type="button"
                className="btn-ghost px-3 py-1.5 text-xs"
                onClick={() => onDownload(v.id)}
              >
                Download
              </button>
            </div>
          );
        })}
      </div>
      <div className="flex gap-3">
        <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
          Close
        </button>
        <button
          type="button"
          className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
          onClick={() => onExportAll(INVOICES.length)}
        >
          <Download className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
          Export All
        </button>
      </div>
    </div>
  </div>
);

export default SettingsInvoicesModal;

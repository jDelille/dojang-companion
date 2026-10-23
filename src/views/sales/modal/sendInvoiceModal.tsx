import { useState } from "react";
import { FileText, Link as LinkIcon, Mail, MessageCircle, Send } from "lucide-react";
import Modal from "../../../components/common/Modal";
import type { Invoice } from "../../../types/sales";
import { money, totalOf } from "../../../utils/salesUtils";

/*
   Send Invoice — ported from #modal-send in tailwind/src/invoices.html and
   openSend()/doSend() in assets/js/invoices.js.

   Each channel button sends immediately and closes, matching the template's
   [data-send-ch] handler; the gold button uses the generic "sent" toast.
*/

const CHANNELS = [
  { id: "Email", label: "Email", Icon: Mail },
  { id: "WhatsApp", label: "WhatsApp", Icon: MessageCircle },
  { id: "Link", label: "Copy Link", Icon: LinkIcon },
];

type SendInvoiceModalProps = {
  invoice: Invoice | null;
  onClose: () => void;
  onSend: (invoice: Invoice, channel?: string) => void;
};

/*
   Seeded from the invoice on mount. The parent keys this component by invoice
   id, so opening a different invoice remounts it with a fresh recipient —
   preferable to re-seeding from an effect.
*/
const SendInvoiceModal = ({ invoice, onClose, onSend }: SendInvoiceModalProps) => {
  const [to, setTo] = useState(invoice?.email ?? "");

  return (
    <Modal
      open={invoice !== null}
      onClose={onClose}
      title="Send Invoice"
      boxClassName="modal-w-400"
      titleClassName="text-base"
      headerClassName="mb-4"
    >
      <div className="gold-border-card p-3 mb-4 flex items-center gap-3">
        <div className="icon-box ic-gold size-px-40">
          <FileText className="w-[18px] h-[18px] c-gold shrink-0" aria-hidden="true" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-bold c-text font-mono">{invoice?.id ?? "—"}</div>
          <div className="text-[11px] c-dim">{invoice?.customer ?? "—"}</div>
        </div>
        <div className="text-sm font-black gt">{invoice ? money(totalOf(invoice)) : "$0"}</div>
      </div>
      <div className="mb-4">
        <label className="block text-xs font-bold mb-1.5 c-text2">Send to</label>
        <input
          type="text"
          className="fp-input py-2.5 text-sm"
          placeholder="customer@email.com"
          value={to}
          onChange={(e) => setTo(e.target.value)}
        />
      </div>
      <div className="mb-2 text-[10px] font-black uppercase tracking-wider c-dim2">Channel</div>
      <div className="grid grid-cols-3 gap-2 mb-4">
        {CHANNELS.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            className="btn-ghost py-2.5 text-xs flex flex-col items-center gap-1.5"
            onClick={() => invoice && onSend(invoice, id)}
          >
            <Icon className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>
      <button
        type="button"
        className="btn-gold w-full py-2.5 text-sm flex items-center justify-center gap-2"
        onClick={() => invoice && onSend(invoice)}
      >
        <Send className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
        Send Invoice
      </button>
    </Modal>
  );
};

export default SendInvoiceModal;

import { useState } from "react";
import { Send, X } from "lucide-react";
import type { Supplier } from "../../../types/suppliers";
import CommonSelect from "../../../components/common-select/commonSelect";

/*
   Contact Supplier — ported from #modal-contact in tailwind/src/suppliers.html
   and openContact()/confirmContact() in assets/js/suppliers.js. The channel
   options embed the address ("Email — a@b.com"); the hook keeps only the label
   before " — " in its toast.
*/

type SupplierContactModalProps = {
  supplier: Supplier | null;
  onClose: () => void;
  onConfirm: (id: number, channel: string, message: string) => boolean;
};

const SupplierContactModal = ({
  supplier,
  onClose,
  onConfirm,
}: SupplierContactModalProps) => {
  const open = supplier !== null;

  const channelOptions = supplier
    ? [
        { value: "Email — " + supplier.email, label: "Email — " + supplier.email },
        { value: "Phone — " + supplier.phone, label: "Phone — " + supplier.phone },
        { value: "WhatsApp", label: "WhatsApp" },
      ]
    : [];

  const [channel, setChannel] = useState(channelOptions[0]?.value ?? "");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

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
          <h3 className="text-base font-black c-text">Contact Supplier</h3>
          <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
        <div className="ctx-box mb-4">
          {supplier ? `${supplier.contact} · ${supplier.name}` : "Contact"}
        </div>
        <div className="mb-3">
          <label className="f-label">Channel</label>
          <CommonSelect
            fieldClassName="py-2.5 text-sm"
            ariaLabel="Channel"
            options={channelOptions}
            value={channel}
            onChange={(option) => setChannel(option?.value ?? channelOptions[0]?.value ?? "")}
          />
        </div>
        <div className="mb-3">
          <label className="f-label">Subject</label>
          <input
            type="text"
            className="fp-input py-2.5 text-sm"
            placeholder="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>
        <div>
          <label className="f-label">Message</label>
          <textarea
            className="fp-input py-2.5 text-sm"
            rows={3}
            placeholder="Type your message…"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>
        <div className="flex gap-3 mt-5">
          <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
            onClick={() => {
              if (!supplier) return;
              if (onConfirm(supplier.id, channel, message)) onClose();
            }}
          >
            <Send className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default SupplierContactModal;

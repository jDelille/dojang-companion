import { useState } from "react";
import { CalendarPlus, Mail, MessageCircle, MessageSquare, Phone } from "lucide-react";
import Modal from "../../../components/common/Modal";
import CommonDatePicker from "../../../components/common-date-picker/commonDatePicker";
import type { Lead } from "../../../types/leads";
import { initials } from "../../../utils/formatUtils";
import leadAvatar from "../leadAvatar";

/*
   Contact Lead — ported from #modal-contact in tailwind/src/leads.html and
   openContact() plus the #modal-contact click handler in assets/js/leads.js.

   Each channel button toasts and leaves the modal open, matching [data-ct];
   only "Log & Schedule" closes and advances a New lead to Contacted.
*/

const CHANNELS = [
  { id: "Call", label: "Call", Icon: Phone },
  { id: "SMS", label: "SMS", Icon: MessageSquare },
  { id: "Email", label: "Email", Icon: Mail },
  { id: "WhatsApp", label: "WA", Icon: MessageCircle },
];

type ContactLeadModalProps = {
  lead: Lead | null;
  onClose: () => void;
  onChannel: (lead: Lead, channel: string) => void;
  onSchedule: (lead: Lead) => void;
};

const ContactLeadModal = ({ lead, onClose, onChannel, onSchedule }: ContactLeadModalProps) => {
  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState("10:00");

  return (
    <Modal
      open={lead !== null}
      onClose={onClose}
      title="Contact Lead"
      boxClassName="modal-w-400"
      titleClassName="text-base"
      headerClassName="mb-4"
    >
      <div className="gold-border-card p-3 mb-4 flex items-center gap-3">
        <div className={`lead-av av ${lead ? leadAvatar(lead.id) : "av-gold"}`}>
          {lead ? initials(lead.name) : "--"}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold c-text">{lead?.name ?? "—"}</div>
          <div className="text-[11px] c-dim">
            {lead ? `${lead.phone} · ${lead.email}` : "—"}
          </div>
        </div>
      </div>
      <div className="mb-2 text-[10px] font-black uppercase tracking-wider c-dim2">
        Reach out via
      </div>
      <div className="grid grid-cols-4 gap-2 mb-4">
        {CHANNELS.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            className="btn-ghost py-2.5 text-[11px] flex flex-col items-center gap-1.5"
            onClick={() => lead && onChannel(lead, id)}
          >
            <Icon className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>
      <div className="mb-2 text-[10px] font-black uppercase tracking-wider c-dim2">
        Schedule follow-up
      </div>
      <div className="grid grid-cols-2 gap-2 mb-4">
        <CommonDatePicker
          className="py-2.5 text-sm"
          dateFormat="d M, yy"
          ariaLabel="Follow-up date"
          value={date}
          onChange={(e) => setDate((e.value as Date) ?? null)}
        />
        <input
          type="time"
          className="fp-input py-2.5 text-sm"
          value={time}
          onChange={(e) => setTime(e.target.value)}
        />
      </div>
      <button
        type="button"
        className="btn-gold w-full py-2.5 text-sm flex items-center justify-center gap-2"
        onClick={() => lead && onSchedule(lead)}
      >
        <CalendarPlus className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
        Log &amp; Schedule Follow-up
      </button>
    </Modal>
  );
};

export default ContactLeadModal;

import { useEffect, useState } from "react";
import { BellRing, Send, X } from "lucide-react";
import CommonSelect from "../../../components/common-select/commonSelect";
import type { RenewalMember } from "../../../types/renewals";
import {
  DEFAULT_RENEWAL_MESSAGE,
  REMINDER_CHANNELS,
} from "../../../utils/json/renewalsData";
import { initials } from "../../../utils/formatUtils";
import leadAvatar from "../leadAvatar";
import DaysPill from "../daysPill";
import DialogEyebrow from "@/components/common/DialogEyebrow";

/*
   Send Reminder — ported from #modal-reminder in tailwind/src/renewals.html
   and openReminder()/sendReminder() in assets/js/renewals.js.

   Sending advances a never-contacted member to Reminded; members further
   along keep their stage.
*/

const toOptions = (values: readonly string[]) =>
  values.map((value) => ({ value, label: value }));

type RenewalReminderModalProps = {
  member: RenewalMember | null;
  onClose: () => void;
  onSend: (member: RenewalMember, channel: string) => void;
};

const RenewalReminderModal = ({ member, onClose, onSend }: RenewalReminderModalProps) => {
  const open = member !== null;
  const [channel, setChannel] = useState(REMINDER_CHANNELS[0]);
  const [message, setMessage] = useState(DEFAULT_RENEWAL_MESSAGE);

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
      <div className="modal-box glass modal-w-420">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="icon-box ic-orange ic-38">
              <BellRing className="w-[17px] h-[17px] c-orange shrink-0" aria-hidden="true" />
            </div>
            <DialogEyebrow />
            <h3 className="text-base font-black c-text">Send Reminder</h3>
          </div>
          <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
        <div className="gold-border-card p-3 mb-4 flex items-center gap-3">
          <div className={`ren-avatar av ${member ? leadAvatar(member.id) : "av-gold"}`}>
            {member ? initials(member.name) : "--"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold c-text">{member?.name ?? "—"}</div>
            <div className="text-[11px] c-dim">{member?.plan ?? "—"}</div>
          </div>
          <DaysPill member={member} />
        </div>
        <div className="space-y-3">
          <div>
            <label className="f-label">Channel</label>
            <CommonSelect
              fieldClassName="py-2.5 text-sm"
              ariaLabel="Channel"
              options={toOptions(REMINDER_CHANNELS)}
              value={channel}
              onChange={(option) => setChannel(option?.value ?? REMINDER_CHANNELS[0])}
            />
          </div>
          <div>
            <label className="f-label">Message</label>
            <textarea
              className="fp-input py-2.5 text-sm"
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
            onClick={() => member && onSend(member, channel)}
          >
            <Send className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            Send Reminder
          </button>
        </div>
      </div>
    </div>
  );
};

export default RenewalReminderModal;

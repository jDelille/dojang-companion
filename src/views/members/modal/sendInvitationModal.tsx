import { useEffect, useState } from "react";
import { Send, X } from "lucide-react";
import CommonSelect from "../../../components/common-select/commonSelect";
import {
  DEFAULT_INVITE_MESSAGE,
  INVITE_CHANNELS,
  REFERRING_MEMBERS,
} from "../../../utils/json/referralsData";

/*
   Send Invitation — ported from #modal-invite in tailwind/src/referrals.html
   and confirmInvite() in assets/js/referrals.js.

   Sending only toasts; no referral row is created, as in the template.
*/

const toOptions = (values: readonly string[]) =>
  values.map((value) => ({ value, label: value }));

type SendInvitationModalProps = {
  open: boolean;
  onClose: () => void;
  onSend: (channel: string, to: string) => void;
};

const SendInvitationModal = ({ open, onClose, onSend }: SendInvitationModalProps) => {
  const [channel, setChannel] = useState(INVITE_CHANNELS[0]);
  const [by, setBy] = useState(REFERRING_MEMBERS[0]);
  const [to, setTo] = useState("");
  const [message, setMessage] = useState(DEFAULT_INVITE_MESSAGE);

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
      <div className="modal-box glass modal-w-460">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="icon-box grad-gold ic-38">
              <Send className="w-[17px] h-[17px] t-ink shrink-0" aria-hidden="true" />
            </div>
            <h3 className="text-base font-black c-text">Send Invitation</h3>
          </div>
          <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="f-label">Channel</label>
            <CommonSelect
              fieldClassName="py-2.5 text-sm"
              ariaLabel="Channel"
              options={toOptions(INVITE_CHANNELS)}
              value={channel}
              onChange={(option) => setChannel(option?.value ?? INVITE_CHANNELS[0])}
            />
          </div>
          <div>
            <label className="f-label">From Member</label>
            <CommonSelect
              fieldClassName="py-2.5 text-sm"
              ariaLabel="From member"
              options={toOptions(REFERRING_MEMBERS)}
              value={by}
              onChange={(option) => setBy(option?.value ?? REFERRING_MEMBERS[0])}
            />
          </div>
          <div className="col-span-2">
            <label className="f-label">Recipient (phone / email)</label>
            <input
              type="text"
              className="fp-input py-2.5 text-sm"
              placeholder="(512) 555-0142 or name@email.com"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>
          <div className="col-span-2">
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
            onClick={() => onSend(channel, to.trim())}
          >
            <Send className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            Send Invitation
          </button>
        </div>
      </div>
    </div>
  );
};

export default SendInvitationModal;

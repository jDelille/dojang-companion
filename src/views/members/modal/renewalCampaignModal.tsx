import { useEffect, useState } from "react";
import { Send, X } from "lucide-react";
import CommonSelect from "../../../components/common-select/commonSelect";
import {
  CAMPAIGN_AUDIENCES,
  CAMPAIGN_CHANNELS,
  CAMPAIGN_OFFERS,
  DEFAULT_RENEWAL_MESSAGE,
} from "../../../utils/json/renewalsData";

/*
   Renewal Campaign — ported from #modal-campaign in tailwind/src/renewals.html
   and openCampaign()/audienceCount()/sendCampaign() in assets/js/renewals.js.

   The recipient count recalculates as the audience changes, which the
   template wired through a change listener on #cm-audience.
*/

const toOptions = (values: readonly string[]) =>
  values.map((value) => ({ value, label: value }));

type RenewalCampaignModalProps = {
  open: boolean;
  onClose: () => void;
  /** Number of members the chosen audience reaches. */
  countFor: (audience: string) => number;
  onSend: (count: number, channel: string) => void;
};

const RenewalCampaignModal = ({
  open,
  onClose,
  countFor,
  onSend,
}: RenewalCampaignModalProps) => {
  const [audience, setAudience] = useState(CAMPAIGN_AUDIENCES[0]);
  const [channel, setChannel] = useState(CAMPAIGN_CHANNELS[0]);
  const [offer, setOffer] = useState(CAMPAIGN_OFFERS[0]);
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

  const count = countFor(audience);

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
            <div className="icon-box ic-gold ic-38">
              <Send className="w-[17px] h-[17px] c-gold shrink-0" aria-hidden="true" />
            </div>
            <h3 className="text-base font-black c-text">Renewal Campaign</h3>
          </div>
          <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold mb-1.5 c-text2">Audience</label>
            <CommonSelect
              fieldClassName="py-2.5 text-sm"
              ariaLabel="Audience"
              options={toOptions(CAMPAIGN_AUDIENCES)}
              value={audience}
              onChange={(option) => setAudience(option?.value ?? CAMPAIGN_AUDIENCES[0])}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold mb-1.5 c-text2">Channel</label>
              <CommonSelect
                fieldClassName="py-2.5 text-sm"
                ariaLabel="Channel"
                options={toOptions(CAMPAIGN_CHANNELS)}
                value={channel}
                onChange={(option) => setChannel(option?.value ?? CAMPAIGN_CHANNELS[0])}
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1.5 c-text2">Incentive</label>
              <CommonSelect
                fieldClassName="py-2.5 text-sm"
                ariaLabel="Incentive"
                options={toOptions(CAMPAIGN_OFFERS)}
                value={offer}
                onChange={(option) => setOffer(option?.value ?? CAMPAIGN_OFFERS[0])}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold mb-1.5 c-text2">Message</label>
            <textarea
              className="fp-input py-2.5 text-sm"
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
          <div className="rounded-xl p-3 flex items-center justify-between cm-recipients">
            <span className="text-[12px] c-dim">Recipients</span>
            <span className="text-sm font-black gt">{count} members</span>
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
            onClick={() => onSend(count, channel)}
          >
            <Send className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            Send Campaign
          </button>
        </div>
      </div>
    </div>
  );
};

export default RenewalCampaignModal;

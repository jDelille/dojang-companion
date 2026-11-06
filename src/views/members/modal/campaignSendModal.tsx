import { useEffect } from "react";
import { Send, X } from "lucide-react";
import type { Campaign } from "../../../types/campaigns";
import { number } from "../../../utils/formatUtils";
import { audienceSize } from "../useCampaigns";
import DialogEyebrow from "@/components/common/DialogEyebrow";

/*
   Send Campaign — ported from #modal-send in tailwind/src/campaigns.html and
   openSend()/confirmSend() in assets/js/campaigns.js.
*/

type CampaignSendModalProps = {
  campaign: Campaign | null;
  onClose: () => void;
  onSend: (campaign: Campaign, size: number) => void;
};

const CampaignSendModal = ({ campaign, onClose, onSend }: CampaignSendModalProps) => {
  const open = campaign !== null;
  const size = campaign ? audienceSize(campaign.segment) : 0;

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
            <div className="icon-box grad-gold ic-38">
              <Send className="w-[17px] h-[17px] t-ink shrink-0" aria-hidden="true" />
            </div>
            <DialogEyebrow />
            <h3 className="text-base font-black c-text">Send Campaign</h3>
          </div>
          <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
        <div className="p-3 rounded-xl mb-4 text-[13px] c-dim ctx-box gold-border-card">
          {campaign ? `${campaign.name} · ${campaign.channel} → ${campaign.segment}` : "—"}
        </div>
        <div className="amount-box">
          <span className="text-xs c-dim font-semibold">Recipients</span>
          <span className="text-lg font-black gt">{number(size)}</span>
        </div>
        <div className="flex gap-3 mt-5">
          <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
            onClick={() => campaign && onSend(campaign, size)}
          >
            <Send className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            Send Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default CampaignSendModal;

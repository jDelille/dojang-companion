import { Check } from "lucide-react";
import Modal from "../../../components/common/Modal";
import type { Campaign } from "../../../types/campaigns";
import {
  CAMPAIGN_STATUS_BADGE,
  CHANNEL_META,
} from "../../../utils/json/campaignsData";
import { number } from "../../../utils/formatUtils";
import CHANNEL_ICON from "../channelIcon";

/*
   Campaign Performance — ported from #modal-detail in
   tailwind/src/campaigns.html and openDetail() in assets/js/campaigns.js.
*/

export type FunnelStep = {
  label: string;
  value: number;
  cls: string;
  width: number;
  pct: number;
};

type CampaignDetailModalProps = {
  campaign: Campaign | null;
  funnel: FunnelStep[];
  onClose: () => void;
};

const CampaignDetailModal = ({ campaign, funnel, onClose }: CampaignDetailModalProps) => {
  const Icon = campaign ? CHANNEL_ICON[campaign.channel] : CHANNEL_ICON.Email;
  const meta = campaign ? CHANNEL_META[campaign.channel] : CHANNEL_META.Email;

  return (
    <Modal
      open={campaign !== null}
      onClose={onClose}
      title="Campaign Performance"
      boxClassName="glass modal-w-520"
      titleClassName="text-base"
      headerClassName="mb-4"
    >
      <div className="gold-border-card p-4 mb-4">
        <div className="flex items-center gap-3 mb-3">
          <div className={`chan-ic ${meta.cls}`}>
            <Icon className="w-[18px] h-[18px] c-gold shrink-0" aria-hidden="true" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-black c-text">{campaign?.name ?? "—"}</div>
            <div className="text-[11px] c-dim">
              {campaign
                ? `${campaign.channel} · ${campaign.segment} · ${campaign.when}`
                : "—"}
            </div>
          </div>
          <span
            className={`badge ${campaign ? CAMPAIGN_STATUS_BADGE[campaign.status] : "badge-present"}`}
          >
            <span className="dot" />
            {campaign?.status ?? "—"}
          </span>
        </div>
      </div>
      <div className="mb-2 text-[10px] font-black uppercase tracking-wider c-dim2">
        Delivery Funnel
      </div>
      <div className="space-y-2 mb-4">
        {funnel.map((step) => (
          <div key={step.label} className="flex items-center gap-3">
            <span className="text-[11px] c-dim fn-label">{step.label}</span>
            <div className="flex-1 fn-track">
              <div className={`funnel-bar ${step.cls}`} style={{ width: `${step.width}%` }}>
                {number(step.value)}
              </div>
            </div>
            <span className="text-[11px] font-bold c-dim2 fn-pct">{step.pct}%</span>
          </div>
        ))}
      </div>
      <button
        type="button"
        className="btn-gold w-full py-2.5 text-sm flex items-center justify-center gap-2"
        onClick={onClose}
      >
        <Check className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
        Close
      </button>
    </Modal>
  );
};

export default CampaignDetailModal;

import { useState, type FormEvent } from "react";
import { Send } from "lucide-react";
import Modal from "../../../components/common/Modal";
import CommonSelect from "../../../components/common-select/commonSelect";
import type {
  Campaign,
  CampaignChannel,
  CampaignSegment,
} from "../../../types/campaigns";
import {
  CHANNEL_OPTIONS,
  SEGMENT_OPTIONS,
  SEND_OPTIONS,
} from "../../../utils/json/campaignsData";
import type { CampaignFormInput } from "../useCampaigns";

/*
   New / Edit Campaign — ported from #modal-new in
   tailwind/src/campaigns.html and openAdd()/openEdit()/saveNew() in
   assets/js/campaigns.js.

   Editing seeds the "Send" field from the current status, which is how the
   template mapped a saved campaign back onto the form.
*/

const toOptions = (values: readonly string[]) =>
  values.map((value) => ({ value, label: value }));

/** Reverse of statusFor(): which Send option a saved status corresponds to. */
const sendOptionFor = (campaign: Campaign | null): string => {
  if (!campaign) return SEND_OPTIONS[0];
  if (campaign.status === "Sent") return "Send now";
  if (campaign.status === "Scheduled") return "Schedule for later";
  return "Save as draft";
};

type CampaignFormModalProps = {
  open: boolean;
  /** The campaign being edited, or null when creating. */
  campaign: Campaign | null;
  onClose: () => void;
  onSave: (input: CampaignFormInput) => void;
};

const CampaignFormModal = ({
  open,
  campaign,
  onClose,
  onSave,
}: CampaignFormModalProps) => {
  const [name, setName] = useState(campaign?.name ?? "");
  const [channel, setChannel] = useState<CampaignChannel>(campaign?.channel ?? "Email");
  const [segment, setSegment] = useState<CampaignSegment>(
    campaign?.segment ?? "All Members",
  );
  const [subject, setSubject] = useState(campaign?.subject ?? "");
  const [when, setWhen] = useState(sendOptionFor(campaign));

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSave({ id: campaign?.id ?? null, name, channel, segment, subject, when });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={campaign ? "Edit Campaign" : "New Campaign"}
      boxClassName="glass modal-w-520"
      titleClassName="text-base"
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-xs font-bold mb-1.5 c-text2">Campaign Name</label>
          <input
            type="text"
            className="fp-input py-2.5 text-sm"
            placeholder="e.g. August Renewal Push"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold mb-1.5 c-text2">Channel</label>
            <CommonSelect
              fieldClassName="py-2.5 text-sm"
              ariaLabel="Channel"
              options={toOptions(CHANNEL_OPTIONS)}
              value={channel}
              onChange={(option) =>
                setChannel((option?.value as CampaignChannel) ?? "Email")
              }
            />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1.5 c-text2">Audience</label>
            <CommonSelect
              fieldClassName="py-2.5 text-sm"
              ariaLabel="Audience"
              options={toOptions(SEGMENT_OPTIONS)}
              value={segment}
              onChange={(option) =>
                setSegment((option?.value as CampaignSegment) ?? "All Members")
              }
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold mb-1.5 c-text2">
            Subject / First line
          </label>
          <input
            type="text"
            className="fp-input py-2.5 text-sm"
            placeholder="Your headline…"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-bold mb-1.5 c-text2">Send</label>
          <CommonSelect
            fieldClassName="py-2.5 text-sm"
            ariaLabel="Send"
            options={toOptions(SEND_OPTIONS)}
            value={when}
            onChange={(option) => setWhen(option?.value ?? SEND_OPTIONS[0])}
          />
        </div>
        <div className="flex gap-3 pt-1">
          <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            type="submit"
            className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
          >
            <Send className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            Create
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CampaignFormModal;

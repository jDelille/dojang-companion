import { useEffect, useState } from "react";
import { CalendarCheck, CalendarClock, X } from "lucide-react";
import CommonDatePicker from "../../../components/common-date-picker/commonDatePicker";
import type { Campaign } from "../../../types/campaigns";
import { formatSeedDate } from "../../../utils/formatUtils";
import DialogEyebrow from "@/components/common/DialogEyebrow";

/*
   Schedule Campaign — ported from #modal-schedule in
   tailwind/src/campaigns.html and openSchedule()/confirmSchedule() in
   assets/js/campaigns.js.

   The resulting label reads "Sends <date> <time>", as the template built it.
*/

/* The template ships these fields pre-filled. */
const DEFAULT_DATE = new Date(2026, 7, 1);
const DEFAULT_TIME = "09:00";

type CampaignScheduleModalProps = {
  campaign: Campaign | null;
  onClose: () => void;
  onSchedule: (campaign: Campaign, label: string) => void;
};

const CampaignScheduleModal = ({
  campaign,
  onClose,
  onSchedule,
}: CampaignScheduleModalProps) => {
  const open = campaign !== null;
  const [date, setDate] = useState<Date | null>(DEFAULT_DATE);
  const [time, setTime] = useState(DEFAULT_TIME);

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

  const confirm = () => {
    if (!campaign) return;
    const datePart = formatSeedDate(date, "—");
    onSchedule(campaign, `Sends ${datePart}${time ? ` ${time}` : ""}`);
  };

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
              <CalendarClock
                className="w-[17px] h-[17px] t-ink shrink-0"
                aria-hidden="true"
              />
            </div>
            <DialogEyebrow />
            <h3 className="text-base font-black c-text">Schedule Campaign</h3>
          </div>
          <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
        <div className="p-3 rounded-xl mb-4 text-[13px] c-gold gold-border-card">
          {campaign
            ? `${campaign.name} · ${campaign.channel} · ${campaign.segment}`
            : "—"}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="f-label">Date</label>
            <CommonDatePicker
              className="py-2.5 text-sm"
              dateFormat="d M, yy"
              ariaLabel="Schedule date"
              value={date}
              onChange={(e) => setDate((e.value as Date) ?? null)}
            />
          </div>
          <div>
            <label className="f-label">Time</label>
            <input
              type="time"
              className="fp-input py-2.5 text-sm"
              value={time}
              onChange={(e) => setTime(e.target.value)}
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
            onClick={confirm}
          >
            <CalendarCheck className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            Schedule
          </button>
        </div>
      </div>
    </div>
  );
};

export default CampaignScheduleModal;

import { Send } from "lucide-react";
import type { Announcement } from "../../../types/announcements";
import { estReach } from "../../../utils/json/announcementsData";
import { fmtDateTime } from "../useAnnouncements";
import DialogEyebrow from "@/components/common/DialogEyebrow";

/*
   Publish Now — ported from #modal-publish in tailwind/src/announcements.html and
   openPublish()/confirmPublish() in assets/js/announcements.js. The warning row
   only shows when overriding a scheduled send.
*/

type AnnouncementPublishModalProps = {
  announcement: Announcement | null;
  onClose: () => void;
  onConfirm: (id: number) => void;
};

const AnnouncementPublishModal = ({
  announcement: a,
  onClose,
  onConfirm,
}: AnnouncementPublishModalProps) => {
  const open = a !== null;
  const isResched = a?.status === "Scheduled";

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
        <div className="confirm-ic gold">
          <Send className="w-6 h-6 c-gold shrink-0" aria-hidden="true" />
        </div>
        <DialogEyebrow />
        <h3 className="text-base font-black c-text text-center mb-1">Publish Now?</h3>
        <p className="text-sm text-center mb-4 c-dim">
          <span className="font-semibold c-text">
            {a ? "“" + a.title + "”" : "This announcement"}
          </span>{" "}
          goes live immediately.
        </p>
        <div className="ctx-box mb-4">
          {a
            ? a.audience +
              " · ~" +
              estReach(a.audience).toLocaleString("en-US") +
              " people · via " +
              (a.channels.join(", ") || "In-App")
            : "—"}
        </div>
        <div className={`ctx-box mb-4${isResched ? "" : " hidden"}`}>
          <span className="c-orange font-semibold">Note:</span> this overrides the scheduled send
          for {a ? fmtDateTime(a.publishAt) : "—"}.
        </div>
        <div className="flex gap-3">
          <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
            onClick={() => {
              if (!a) return;
              onConfirm(a.id);
              onClose();
            }}
          >
            <Send className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            Publish
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementPublishModal;

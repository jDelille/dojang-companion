import { EyeOff } from "lucide-react";
import type { Announcement } from "../../../types/announcements";
import { fmtDateTime } from "../useAnnouncements";
import DialogEyebrow from "@/components/common/DialogEyebrow";

/*
   Unpublish — ported from #modal-unpublish in tailwind/src/announcements.html and
   openUnpublish()/confirmUnpublish() in assets/js/announcements.js.
*/

type AnnouncementUnpublishModalProps = {
  announcement: Announcement | null;
  onClose: () => void;
  onConfirm: (id: number) => void;
};

const AnnouncementUnpublishModal = ({
  announcement: a,
  onClose,
  onConfirm,
}: AnnouncementUnpublishModalProps) => {
  const open = a !== null;

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
        <div className="confirm-ic warn">
          <EyeOff className="w-6 h-6 c-orange shrink-0" aria-hidden="true" />
        </div>
        <DialogEyebrow />
        <h3 className="text-base font-black c-text text-center mb-1">Unpublish?</h3>
        <p className="text-sm text-center mb-4 c-dim">
          <span className="font-semibold c-text">
            {a ? "“" + a.title + "”" : "This announcement"}
          </span>{" "}
          is pulled from the member app and dashboard, and returns to Drafts.
        </p>
        <div className="ctx-box mb-5">
          {a
            ? "Live since " +
              fmtDateTime(a.publishAt) +
              (a.reach ? " · already reached " + a.reach.toLocaleString("en-US") + " people" : "")
            : "—"}
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
            <EyeOff className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            Unpublish
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementUnpublishModal;

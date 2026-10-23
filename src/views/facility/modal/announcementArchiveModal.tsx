import { Archive } from "lucide-react";
import type { Announcement } from "../../../types/announcements";
import { fmtDateTime } from "../useAnnouncements";

/*
   Archive — ported from #modal-archive in tailwind/src/announcements.html and
   openArchive()/confirmArchive() in assets/js/announcements.js.
*/

type AnnouncementArchiveModalProps = {
  announcement: Announcement | null;
  onClose: () => void;
  onConfirm: (id: number) => void;
};

const AnnouncementArchiveModal = ({
  announcement: a,
  onClose,
  onConfirm,
}: AnnouncementArchiveModalProps) => {
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
      <div className="modal-box glass modal-w-420">
        <div className="confirm-ic warn">
          <Archive className="w-6 h-6 c-orange shrink-0" aria-hidden="true" />
        </div>
        <h3 className="text-base font-black c-text text-center mb-1">Archive Announcement?</h3>
        <p className="text-sm text-center mb-4 c-dim">
          <span className="font-semibold c-text">
            {a ? "“" + a.title + "”" : "This announcement"}
          </span>{" "}
          is marked expired and removed from the member app. Reach stats are kept.
        </p>
        <div className="ctx-box mb-5">
          {a
            ? a.reach
              ? "Reached " +
                a.reach.toLocaleString("en-US") +
                " people · live since " +
                fmtDateTime(a.publishAt)
              : "This announcement has not been published yet"
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
            <Archive className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            Archive
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementArchiveModal;

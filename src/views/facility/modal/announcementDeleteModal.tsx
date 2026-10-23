import { Trash2 } from "lucide-react";
import type { Announcement } from "../../../types/announcements";

/*
   Delete — ported from #modal-delete in tailwind/src/announcements.html and
   openDelete()/confirmDelete() in assets/js/announcements.js. The live warning
   only shows for an Active announcement.
*/

type AnnouncementDeleteModalProps = {
  announcement: Announcement | null;
  onClose: () => void;
  onConfirm: (id: number) => void;
};

const AnnouncementDeleteModal = ({
  announcement: a,
  onClose,
  onConfirm,
}: AnnouncementDeleteModalProps) => {
  const open = a !== null;
  const live = a?.status === "Active";

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
        <div className="confirm-ic danger">
          <Trash2 className="w-6 h-6 c-red shrink-0" aria-hidden="true" />
        </div>
        <h3 className="text-base font-black c-text text-center mb-1">Delete Announcement?</h3>
        <p className="text-sm text-center mb-4 c-dim">
          Permanently remove{" "}
          <span className="font-semibold c-text">
            {a ? "“" + a.title + "”" : "this announcement"}
          </span>
          . This cannot be undone.
        </p>
        <div className={`ctx-box mb-5${live ? "" : " hidden"}`}>
          <span className="c-orange font-semibold">This is live now</span> and has reached{" "}
          {a ? a.reach.toLocaleString("en-US") : "0"} people. Unpublish instead if you only want to
          pull it from the app.
        </div>
        <div className="flex gap-3">
          <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-danger flex-1 py-2.5 text-sm"
            onClick={() => {
              if (!a) return;
              onConfirm(a.id);
              onClose();
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementDeleteModal;

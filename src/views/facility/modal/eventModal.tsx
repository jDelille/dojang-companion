import { X } from "lucide-react";
import type { AccessEvent } from "../../../types/accessControl";
import { TYPE_META } from "../../../utils/json/accessControlData";
import DialogEyebrow from "@/components/common/DialogEyebrow";

/*
   Access Event details — ported from #modal-event in
   tailwind/src/access-control.html and openEvent() in
   assets/js/access-control.js.
*/

type EventModalProps = {
  event: AccessEvent | null;
  onClose: () => void;
};

const EventModal = ({ event, onClose }: EventModalProps) => {
  const open = event !== null;
  const meta = event ? TYPE_META[event.type] : null;

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
      <div className="modal-box glass modal-w-380">
        <div className="flex items-center justify-between mb-4">
          <div className="min-w-0">
            <DialogEyebrow />
            <h3 className="text-base font-black c-text">Access Event</h3>
          </div>
          <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-black c-text">{event?.name ?? "—"}</div>
          <span className={`badge ${meta?.badge ?? "badge-present"}`}>{event?.type ?? "—"}</span>
        </div>
        <div>
          <div className="detail-row">
            <span className="k">Door</span>
            <span className="v">{event?.door ?? "—"}</span>
          </div>
          <div className="detail-row">
            <span className="k">Method</span>
            <span className="v">{event?.method ?? "—"}</span>
          </div>
          <div className="detail-row">
            <span className="k">Time</span>
            <span className="v">{event?.time ?? "—"}</span>
          </div>
          <div className="detail-row">
            <span className="k">Reason</span>
            <span className="v">{event?.reason || "—"}</span>
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button type="button" className="btn-gold flex-1 py-2.5 text-sm" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventModal;

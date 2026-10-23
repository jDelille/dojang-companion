import { History, LogOut } from "lucide-react";
import Modal from "../../../components/common/Modal";
import type { CheckinLogEntry } from "../../../types/checkin";
import { LOG_STATUS_BADGE } from "../../../utils/json/checkinData";

/*
   Check-In Details — ported from #modal-view in tailwind/src/checkin.html
   and openView() in assets/js/checkin.js.
*/

type CheckinViewModalProps = {
  entry: CheckinLogEntry | null;
  onClose: () => void;
  onHistory: (entry: CheckinLogEntry) => void;
  onCheckOut: (entry: CheckinLogEntry) => void;
};

const CheckinViewModal = ({
  entry,
  onClose,
  onHistory,
  onCheckOut,
}: CheckinViewModalProps) => (
  <Modal
    open={entry !== null}
    onClose={onClose}
    title="Check-In Details"
    boxClassName="glass modal-w-420"
    closeClassName="modal-x"
    titleClassName="text-base"
    headerClassName="mb-4"
  >
    <div className="gold-border-card p-4 mb-4 flex items-center gap-3">
      <div className={`ci-av ci-av-lg ${entry?.tint ?? "av-gold-t"}`}>
        {entry?.initials ?? "--"}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-black c-text">{entry?.name ?? "—"}</div>
        <div className="text-[11px] c-dim">{entry?.plan ?? "—"}</div>
      </div>
      <span
        className={`${entry ? LOG_STATUS_BADGE[entry.status] : "badge-active"} text-[10px] font-bold px-2 py-0.5 rounded-full`}
      >
        {entry?.status ?? "—"}
      </span>
    </div>
    <div className="grid grid-cols-2 gap-3 mb-4">
      <div className="hist-row block!">
        <div className="f-label">Check-In</div>
        <div className="text-sm font-bold c-text">{entry?.time ?? "—"}</div>
      </div>
      <div className="hist-row block!">
        <div className="f-label">Trainer</div>
        <div className="text-sm font-bold c-text">{entry?.trainer ?? "—"}</div>
      </div>
      <div className="hist-row block!">
        <div className="f-label">Locker</div>
        <div className="text-sm font-bold c-text">{entry?.locker ?? "—"}</div>
      </div>
      <div className="hist-row block!">
        <div className="f-label">Notes</div>
        <div className="text-sm font-bold c-text">{entry?.notes ?? "—"}</div>
      </div>
    </div>
    <div className="flex gap-2">
      <button
        type="button"
        className="btn-ghost flex-1 py-2.5 text-sm flex items-center justify-center gap-1.5"
        onClick={() => entry && onHistory(entry)}
      >
        <History className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
        History
      </button>
      <button
        type="button"
        className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-1.5"
        onClick={() => entry && onCheckOut(entry)}
      >
        <LogOut className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
        Check Out
      </button>
    </div>
  </Modal>
);

export default CheckinViewModal;

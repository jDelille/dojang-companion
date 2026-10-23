import { CalendarCheck, History } from "lucide-react";
import Modal from "../../../components/common/Modal";
import type { CheckinLogEntry } from "../../../types/checkin";
import { CHECKIN_HISTORY } from "../../../utils/json/checkinData";

/*
   Attendance History — ported from #modal-history in
   tailwind/src/checkin.html and openHistory() in assets/js/checkin.js.

   Today's row reads from the live entry — its check-in time with "Active" as
   the duration — while the rest is the fixed demo list.
*/

type CheckinHistoryModalProps = {
  entry: CheckinLogEntry | null;
  onClose: () => void;
};

const CheckinHistoryModal = ({ entry, onClose }: CheckinHistoryModalProps) => {
  const rows = entry
    ? [{ d: "Today", t: entry.time, dur: "Active" }, ...CHECKIN_HISTORY]
    : [];

  return (
    <Modal
      open={entry !== null}
      onClose={onClose}
      title={
        <span className="flex items-center gap-2.5">
          <span className="icon-box grad-gold ic-38">
            <History className="w-[17px] h-[17px] t-ink shrink-0" aria-hidden="true" />
          </span>
          Attendance History
        </span>
      }
      boxClassName="glass modal-w-460"
      closeClassName="modal-x"
      titleClassName="text-base"
      headerClassName="mb-4"
    >
      <div className="gold-border-card p-3 mb-4 flex items-center gap-3">
        <div className={`ci-av ci-av-md ${entry?.tint ?? "av-gold-t"}`}>
          {entry?.initials ?? "--"}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold c-text">{entry?.name ?? "—"}</div>
          <div className="text-[11px] c-dim">{entry?.plan ?? "—"}</div>
        </div>
      </div>
      <div className="flex flex-col gap-2 hist-scroll">
        {rows.map((row) => (
          <div key={row.d} className="hist-row">
            <div className="icon-box ic-gold w-9! h-9!">
              <CalendarCheck
                className="w-[15px] h-[15px] c-gold shrink-0"
                aria-hidden="true"
              />
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold c-text">{row.d}</div>
              <div className="text-[11px] c-dim">Checked in {row.t}</div>
            </div>
            <span className="text-xs font-bold c-gold">{row.dur}</span>
          </div>
        ))}
      </div>
    </Modal>
  );
};

export default CheckinHistoryModal;

import { useState } from "react";
import { Unlock, X } from "lucide-react";
import { DEVICES, UNLOCK_DURATIONS } from "../../../utils/json/accessControlData";
import CommonSelect from "../../../components/common-select/commonSelect";

/*
   Remote Unlock — ported from #modal-unlock in tailwind/src/access-control.html
   and openUnlock()/confirmUnlock() in assets/js/access-control.js. Door options
   are the online devices; duration defaults to 10 seconds.
*/

const DOOR_OPTIONS = DEVICES.filter((d) => d.status === "Online").map((d) => ({
  value: d.name,
  label: d.name,
}));
const DURATION_OPTIONS = UNLOCK_DURATIONS.map((value) => ({ value, label: value }));

type UnlockModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: (door: string, duration: string) => void;
};

const UnlockModal = ({ open, onClose, onConfirm }: UnlockModalProps) => {
  const [door, setDoor] = useState(DOOR_OPTIONS[0]?.value ?? "Main Entrance");
  const [duration, setDuration] = useState("10 seconds");

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
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-black c-text">Remote Unlock</h3>
          <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="f-label">Door</label>
            <CommonSelect
              fieldClassName="py-2.5 text-sm"
              ariaLabel="Door"
              options={DOOR_OPTIONS}
              value={door}
              onChange={(option) => setDoor(option?.value ?? DOOR_OPTIONS[0]?.value ?? "Main Entrance")}
            />
          </div>
          <div>
            <label className="f-label">Duration</label>
            <CommonSelect
              fieldClassName="py-2.5 text-sm"
              ariaLabel="Duration"
              options={DURATION_OPTIONS}
              value={duration}
              onChange={(option) => setDuration(option?.value ?? "10 seconds")}
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
            onClick={() => {
              onConfirm(door, duration);
              onClose();
            }}
          >
            <Unlock className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            Unlock
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnlockModal;

import { useState } from "react";
import { LockOpen } from "lucide-react";
import type { Locker } from "../../../types/lockers";
import { RELEASE_REASONS } from "../../../utils/json/lockersData";
import CommonSelect from "../../../components/common-select/commonSelect";
import { fmtDate } from "../useLockers";

/*
   Release Locker — ported from #modal-release in tailwind/src/lockers.html and
   openRelease()/confirmRelease() in assets/js/lockers.js.
*/

const REASON_OPTIONS = RELEASE_REASONS.map((value) => ({ value, label: value }));

type LockerReleaseModalProps = {
  targets: Locker[];
  onClose: () => void;
  onConfirm: (ids: number[], reason: string, refund: boolean) => void;
};

const LockerReleaseModal = ({ targets, onClose, onConfirm }: LockerReleaseModalProps) => {
  const open = targets.length > 0;
  const [reason, setReason] = useState(RELEASE_REASONS[0]);
  const [refund, setRefund] = useState(true);

  const total = targets.reduce((t, l) => t + l.deposit, 0);
  const name = targets.length === 1 ? "Locker " + targets[0].num : targets.length + " lockers";
  const context =
    targets.length === 1
      ? targets[0].member + " · " + targets[0].memberId + " · since " + fmtDate(targets[0].since)
      : "Releasing: " + targets.map((l) => l.num).join(", ");

  return (
    <div
      className={open ? "modal-overlay open" : "modal-overlay"}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="rl-title"
      aria-hidden={!open}
    >
      <div className="modal-box glass modal-w-420">
        <div className="confirm-ic warn">
          <LockOpen className="w-6 h-6 c-orange shrink-0" aria-hidden="true" />
        </div>
        <h3 id="rl-title" className="text-base font-black c-text text-center mb-1">
          Release Locker?
        </h3>
        <p className="text-sm text-center mb-4 c-dim">
          Free up <span className="font-semibold c-text">{name}</span> and end the current
          assignment.
        </p>
        <div className="ctx-box mb-4">{context}</div>
        <div className="mb-4">
          <label className="f-label" htmlFor="rl-reason">
            Reason
          </label>
          <CommonSelect
            fieldClassName="py-2.5 text-sm"
            ariaLabel="Reason"
            options={REASON_OPTIONS}
            value={reason}
            onChange={(o) => setReason(o?.value ?? RELEASE_REASONS[0])}
          />
        </div>
        <label className="flex items-center gap-2.5 text-[13px] c-text2 cursor-pointer mb-5">
          <input
            type="checkbox"
            className="cbx"
            checked={refund}
            onChange={(e) => setRefund(e.target.checked)}
          />
          Refund deposit (<span>{"$" + total.toLocaleString("en-US")}</span>)
        </label>
        <div className="flex gap-3">
          <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
            onClick={() => {
              onConfirm(
                targets.map((l) => l.id),
                reason,
                refund,
              );
              onClose();
            }}
          >
            <LockOpen className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            Release
          </button>
        </div>
      </div>
    </div>
  );
};

export default LockerReleaseModal;

import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  LockOpen,
  Pencil,
  Printer,
  QrCode,
  UserPlus,
  X,
} from "lucide-react";
import type { Locker } from "../../../types/lockers";
import { ICON_COLOR, STATE_BADGE, TINT } from "../../../utils/json/lockersData";
import { LOCKER_ICON, LOCKER_ICON_FALLBACK } from "../lockersIcons";
import { code, fmtDate, initials, isOverdue } from "../useLockers";

/*
   View Locker Details — ported from #modal-view in tailwind/src/lockers.html and
   openView() in assets/js/lockers.js. The primary action follows the locker's
   status: Assign · Mark Fixed · Release.
*/

type LockerViewModalProps = {
  locker: Locker | null;
  onClose: () => void;
  onHistory: () => void;
  onQr: () => void;
  onPrint: () => void;
  onEdit: () => void;
  onAssign: () => void;
  onRelease: () => void;
  onMarkFixed: () => void;
};

const LockerViewModal = ({
  locker,
  onClose,
  onHistory,
  onQr,
  onPrint,
  onEdit,
  onAssign,
  onRelease,
  onMarkFixed,
}: LockerViewModalProps) => {
  const open = locker !== null;
  const Icon = locker ? LOCKER_ICON[locker.status] ?? LOCKER_ICON_FALLBACK : LOCKER_ICON_FALLBACK;

  const primary = (() => {
    if (!locker) return { label: "Assign", Icon: UserPlus, onClick: onAssign };
    if (locker.status === "Available") return { label: "Assign", Icon: UserPlus, onClick: onAssign };
    if (locker.status === "Maintenance") return { label: "Mark Fixed", Icon: CheckCircle2, onClick: onMarkFixed };
    return { label: "Release", Icon: LockOpen, onClick: onRelease };
  })();
  const PrimaryIcon = primary.Icon;

  return (
    <div
      className={open ? "modal-overlay open" : "modal-overlay"}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="lv-heading"
      aria-hidden={!open}
    >
      <div className="modal-box glass modal-w-460">
        <div className="flex items-center justify-between mb-4">
          <h3 id="lv-heading" className="text-base font-black c-text">
            Locker <span>{locker?.num ?? "—"}</span>
          </h3>
          <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>

        <div className="gold-border-card p-4 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <div className={`icon-box ${locker ? TINT[locker.status] : "ic-gold"}`}>
              <Icon
                className={`w-[22px] h-[22px] ${locker ? ICON_COLOR[locker.status] : "c-gold"} shrink-0`}
                aria-hidden="true"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold c-text">{locker ? locker.zone + " Zone" : "—"}</div>
              <div className="text-[11px] c-dim">
                {locker ? locker.size + " locker · " + locker.key : "—"}
              </div>
            </div>
            <span className={`badge ${locker ? STATE_BADGE[locker.status] : "badge-present"}`}>
              <span className="dot" />
              {locker?.status ?? "—"}
            </span>
          </div>
          <div className="pt-3 bd-t">
            {locker && locker.member ? (
              <div className="flex items-center gap-3">
                <div className="av av-gold">{initials(locker.member)}</div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold c-text truncate">{locker.member}</div>
                  <div className="text-[11px] c-dim">
                    {locker.memberId +
                      " · " +
                      (locker.status === "Reserved" ? "Reserved" : "Since " + fmtDate(locker.since))}
                  </div>
                </div>
                {isOverdue(locker) && (
                  <span className="badge badge-expired ml-auto">
                    <span className="dot" />
                    Overdue
                  </span>
                )}
              </div>
            ) : locker && locker.status === "Maintenance" ? (
              <div className="text-[13px] c-orange flex items-center gap-2">
                <AlertTriangle className="w-[14px] h-[14px] shrink-0" aria-hidden="true" />
                Under maintenance — not assignable
              </div>
            ) : (
              <div className="text-[13px] c-green flex items-center gap-2">
                <CheckCircle2 className="w-[14px] h-[14px] shrink-0" aria-hidden="true" />
                Ready to assign
              </div>
            )}
          </div>
        </div>

        <div className="mb-5">
          <div className="detail-row">
            <span className="k">Locker code</span>
            <span className="v font-mono">{locker ? code(locker) : "—"}</span>
          </div>
          <div className="detail-row">
            <span className="k">Key type</span>
            <span className="v">{locker?.key ?? "—"}</span>
          </div>
          <div className="detail-row">
            <span className="k">Deposit</span>
            <span className="v">{locker ? "$" + locker.deposit.toLocaleString("en-US") : "—"}</span>
          </div>
          <div className="detail-row">
            <span className="k">Assigned on</span>
            <span className="v">{fmtDate(locker?.since ?? null)}</span>
          </div>
          <div className="detail-row">
            <span className="k">Expires on</span>
            <span className={`v${locker && isOverdue(locker) ? " c-red" : ""}`}>
              {fmtDate(locker?.expiry ?? null)}
            </span>
          </div>
          <div className="detail-row">
            <span className="k">Notes</span>
            <span className="v">{locker?.notes || "—"}</span>
          </div>
        </div>

        <div className="flex gap-2 mb-2">
          <button
            type="button"
            className="btn-ghost flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
            onClick={onHistory}
          >
            <ClipboardList className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            History
          </button>
          <button
            type="button"
            className="btn-ghost flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
            onClick={onQr}
          >
            <QrCode className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            QR Tag
          </button>
          <button
            type="button"
            className="btn-ghost flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
            onClick={onPrint}
          >
            <Printer className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            Print
          </button>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className="btn-ghost flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
            onClick={onEdit}
          >
            <Pencil className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            Edit
          </button>
          <button
            type="button"
            className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
            aria-label="Primary action"
            onClick={primary.onClick}
          >
            <PrimaryIcon className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            {primary.label}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LockerViewModal;

import {
  ArrowLeftRight,
  Building2,
  Pencil,
  Printer,
  Settings,
  UserCog,
  X,
} from "lucide-react";
import type { Branch } from "../../../types/branches";
import {
  BRANCH_STATUS_BADGE,
  MANAGERS,
  capClass,
  capPct,
  fmtDate,
  hoursOf,
} from "../../../utils/json/branchesData";
import { usd } from "../../../utils/formatUtils";

/*
   Branch Details — ported from #modal-view in tailwind/src/branches.html and
   openView() in assets/js/branches.js. The capacity bar width the JS set with
   applyBars() becomes an inline style.
*/

const num = (n: number) => n.toLocaleString("en-US");

type BranchViewModalProps = {
  branch: Branch | null;
  onClose: () => void;
  onManager: () => void;
  onTransfer: () => void;
  onPrint: () => void;
  onEdit: () => void;
  onSettings: () => void;
};

const BranchViewModal = ({
  branch,
  onClose,
  onManager,
  onTransfer,
  onPrint,
  onEdit,
  onSettings,
}: BranchViewModalProps) => {
  const open = branch !== null;
  const pct = branch ? capPct(branch) : 0;
  const cls = capClass(pct);
  const m = branch ? MANAGERS.find((x) => x.id === branch.managerId) ?? null : null;

  return (
    <div
      className={open ? "modal-overlay open" : "modal-overlay"}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="bd-heading"
      aria-hidden={!open}
    >
      <div className="modal-box glass modal-w-500">
        <div className="flex items-center justify-between mb-4">
          <h3 id="bd-heading" className="text-base font-black c-text">
            Branch Details
          </h3>
          <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>

        <div className="gold-border-card p-4 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="icon-box ic-gold w-[48px] h-[48px]">
              <Building2 className="w-[22px] h-[22px] c-gold shrink-0" aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-lg font-black c-text truncate">{branch?.name ?? "—"}</div>
              <div className="text-[11px] c-dim">{branch?.address ?? "—"}</div>
            </div>
            <span
              className={`badge ${branch ? BRANCH_STATUS_BADGE[branch.status] : "badge-present"}`}
            >
              <span className="dot" />
              {branch?.status ?? "—"}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-3 pt-3 bd-t">
            <div className="br-stat">
              <div className="v gt">{branch && branch.members ? num(branch.members) : "—"}</div>
              <div className="l">Members</div>
            </div>
            <div className="br-stat">
              <div className="v gt">{branch?.staff ?? 0}</div>
              <div className="l">Staff</div>
            </div>
            <div className="br-stat">
              <div className="v gt">{branch && branch.revenue ? usd(branch.revenue) : "—"}</div>
              <div className="l">Revenue</div>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] c-dim2 font-bold uppercase tracking-wider">
              Capacity
            </span>
            <span className={`text-[11px] font-bold cap-val ${cls}`}>
              {pct}% ·{" "}
              {branch ? num(branch.members) + " / " + num(branch.capacity) : "0 / 0"}
            </span>
          </div>
          <div className="cap-track">
            <div className={`cap-fill ${cls}`} style={{ width: `${pct}%` }} />
          </div>
        </div>

        <div className="mb-5">
          <div className="detail-row">
            <span className="k">Manager</span>
            <span className="v">{m ? m.name + " · " + m.role : "Unassigned"}</span>
          </div>
          <div className="detail-row">
            <span className="k">Phone</span>
            <span className="v">{branch?.phone ?? "—"}</span>
          </div>
          <div className="detail-row">
            <span className="k">Email</span>
            <span className="v">{m ? m.email : "—"}</span>
          </div>
          <div className="detail-row">
            <span className="k">Hours</span>
            <span className="v">{branch ? hoursOf(branch) : "—"}</span>
          </div>
          <div className="detail-row">
            <span className="k">Rating</span>
            <span className="v">
              {branch && branch.rating ? branch.rating.toFixed(1) + " / 5.0" : "Not rated yet"}
            </span>
          </div>
          <div className="detail-row">
            <span className="k">Amenities</span>
            <span className="v">
              {branch && branch.amenities.length ? branch.amenities.join(", ") : "None"}
            </span>
          </div>
          <div className="detail-row">
            <span className="k">Opened</span>
            <span className="v">
              {branch
                ? branch.opened
                  ? fmtDate(branch.opened)
                  : branch.openingDate
                    ? "Opening " + fmtDate(branch.openingDate)
                    : "—"
                : "—"}
            </span>
          </div>
        </div>

        <div className="flex gap-2 mb-2">
          <button
            type="button"
            className="btn-ghost flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
            onClick={onManager}
          >
            <UserCog className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            Manager
          </button>
          <button
            type="button"
            className="btn-ghost flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
            onClick={onTransfer}
          >
            <ArrowLeftRight className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            Transfer
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
            onClick={onSettings}
          >
            <Settings className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            Manage Branch
          </button>
        </div>
      </div>
    </div>
  );
};

export default BranchViewModal;

import Link from "next/link";
import { BellRing, RefreshCw } from "lucide-react";
import Modal from "../../../components/common/Modal";
import { all_routes } from "../../../routes/all_routes";
import type { RenewalMember } from "../../../types/renewals";
import { initials, moneyWhole } from "../../../utils/formatUtils";
import leadAvatar from "../leadAvatar";
import DaysPill from "../daysPill";
import { bucketOf } from "../useRenewals";

/*
   Renewal Details — ported from #modal-view in tailwind/src/renewals.html and
   openView() in assets/js/renewals.js.
*/

type RenewalViewModalProps = {
  member: RenewalMember | null;
  onClose: () => void;
  onRemind: (member: RenewalMember) => void;
  onRenew: (member: RenewalMember) => void;
};

const RenewalViewModal = ({ member, onClose, onRemind, onRenew }: RenewalViewModalProps) => (
  <Modal
    open={member !== null}
    onClose={onClose}
    title="Renewal Details"
    boxClassName="glass modal-w-420"
    titleClassName="text-base"
    headerClassName="mb-4"
  >
    <div className="gold-border-card p-4 mb-4 flex items-center gap-3">
      <div
        className={`ren-avatar av ${member ? leadAvatar(member.id) : "av-gold"} w-12! h-12! text-sm! rounded-xl`}
      >
        {member ? initials(member.name) : "--"}
      </div>
      <div className="flex-1 min-w-0">
        <Link
          href={
            member
              ? `${all_routes.memberProfile}?id=${encodeURIComponent(String(member.id))}`
              : all_routes.memberProfile
          }
          className="text-sm font-black c-text hover:text-[var(--text)]"
        >
          {member?.name ?? "—"}
        </Link>
        <div className="text-[11px] c-dim">
          {member ? `${member.plan} · ${member.period}` : "—"}
        </div>
      </div>
      <DaysPill member={member} />
    </div>
    <div className="grid grid-cols-2 gap-3 mb-4">
      <div className="inv-sheet p-3!">
        <div className="f-label">Renewal Value</div>
        <div className="text-lg font-black gt">
          {member ? moneyWhole(member.value) : "$0"}
        </div>
      </div>
      <div className="inv-sheet p-3!">
        <div className="f-label">Last Contact</div>
        <div className="text-sm font-bold c-text">{member?.last ?? "—"}</div>
      </div>
      <div className="inv-sheet p-3!">
        <div className="f-label">Status</div>
        <div className="text-sm font-bold c-text">{member ? bucketOf(member) : "—"}</div>
      </div>
      <div className="inv-sheet p-3!">
        <div className="f-label">Stage</div>
        <div className="text-sm font-bold c-text">{member?.stage ?? "—"}</div>
      </div>
    </div>
    <div className="flex gap-2">
      <button
        type="button"
        className="btn-ghost flex-1 py-2.5 text-sm flex items-center justify-center gap-1.5"
        onClick={() => member && onRemind(member)}
      >
        <BellRing className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
        Remind
      </button>
      <button
        type="button"
        className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-1.5"
        onClick={() => member && onRenew(member)}
      >
        <RefreshCw className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
        Renew
      </button>
    </div>
  </Modal>
);

export default RenewalViewModal;

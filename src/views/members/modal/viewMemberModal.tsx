import Link from "next/link";
import {
  DollarSign,
  Edit2,
  ExternalLink,
  Play,
  RefreshCw,
  ScanLine,
  Snowflake,
  Trash2,
} from "lucide-react";
import Modal from "../../../components/common/Modal";
import { all_routes } from "../../../routes/all_routes";
import type { Member } from "../../../types/members";
import { MEMBER_STATUS_BADGE, PLAN_PRICE, PLAN_UNIT } from "../../../utils/json/membersData";
import { moneyWhole } from "../../../utils/formatUtils";

/*
   Member Details — ported from #modal-view in tailwind/src/members.html and
   openView() in assets/js/members.js.

   The freeze tile swaps its icon, label and action with the member's state,
   exactly as the template rewrote the tile's attributes.
*/

type ViewMemberModalProps = {
  member: Member | null;
  onClose: () => void;
  onCheckin: (member: Member) => void;
  onRenew: (member: Member) => void;
  onFreeze: (member: Member) => void;
  onUnfreeze: (member: Member) => void;
  onPayment: (member: Member) => void;
  onEdit: (member: Member) => void;
  onDelete: (member: Member) => void;
};

const ViewMemberModal = ({
  member,
  onClose,
  onCheckin,
  onRenew,
  onFreeze,
  onUnfreeze,
  onPayment,
  onEdit,
  onDelete,
}: ViewMemberModalProps) => {
  const frozen = member?.status === "Frozen";
  const FreezeIcon = frozen ? Play : Snowflake;

  return (
    <Modal
      open={member !== null}
      onClose={onClose}
      title="Member Details"
      closeClassName="modal-x"
      headerClassName="mb-4"
    >
      <div className="gold-border-card p-4 mb-4">
        <div className="flex items-center gap-3 mb-4">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-black ${member?.av ?? "av-gold"}`}
          >
            {member?.ini ?? "AB"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-lg font-black c-text leading-tight">
              {member ? `${member.first} ${member.last}` : "—"}
            </div>
            <div className="text-[11px] c-dim">
              {member ? `${member.id} · ${member.planLabel}` : "—"}
            </div>
          </div>
          <span
            className={`${member ? MEMBER_STATUS_BADGE[member.status] : "badge-active"} text-[10px] font-bold px-2.5 py-0.5 rounded-full`}
          >
            {member?.status ?? "Active"}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2.5 pt-4 bd-t">
          <div className="detail-cell">
            <div className="dc-k">Phone</div>
            <div className="dc-v">{member?.phone ?? "—"}</div>
          </div>
          <div className="detail-cell">
            <div className="dc-k">Email</div>
            <div className="dc-v truncate">{member?.email ?? "—"}</div>
          </div>
          <div className="detail-cell">
            <div className="dc-k">Plan</div>
            <div className="dc-v">
              {member
                ? `${member.planLabel} · ${moneyWhole(PLAN_PRICE[member.planLabel] ?? 0)}`
                : "—"}
            </div>
          </div>
          <div className="detail-cell">
            <div className="dc-k">Trainer</div>
            <div className="dc-v">{member?.trainer ?? "—"}</div>
          </div>
          <div className="detail-cell">
            <div className="dc-k">Check-ins</div>
            <div className="dc-v">
              {member ? `${member.checkins} ${PLAN_UNIT[member.planLabel] ?? "/ mo"}` : "—"}
            </div>
          </div>
          <div className="detail-cell">
            <div className="dc-k">Expires</div>
            <div className="dc-v">{member?.expiresDisp ?? "—"}</div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-2 mb-4">
        <button
          type="button"
          className="qa-tile"
          onClick={() => member && onCheckin(member)}
        >
          <ScanLine className="shrink-0" aria-hidden="true" />
          <span>Check-in</span>
        </button>
        <button type="button" className="qa-tile" onClick={() => member && onRenew(member)}>
          <RefreshCw className="shrink-0" aria-hidden="true" />
          <span>Renew</span>
        </button>
        <button
          type="button"
          className="qa-tile"
          onClick={() => {
            if (!member) return;
            if (frozen) onUnfreeze(member);
            else onFreeze(member);
          }}
        >
          <FreezeIcon className="shrink-0" aria-hidden="true" />
          <span>{frozen ? "Unfreeze" : "Freeze"}</span>
        </button>
        <button type="button" className="qa-tile" onClick={() => member && onPayment(member)}>
          <DollarSign className="shrink-0" aria-hidden="true" />
          <span>Payment</span>
        </button>
      </div>
      <Link
        href={member ? `${all_routes.memberProfile}?id=${encodeURIComponent(member.id)}` : all_routes.memberProfile}
        className="btn-ghost w-full py-2.5 text-sm flex items-center justify-center gap-1.5 mb-2"
      >
        <ExternalLink className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
        View Full Profile
      </Link>
      <div className="flex gap-3">
        <button
          type="button"
          className="btn-ghost flex-1 py-2.5 text-sm flex items-center justify-center gap-1.5 c-red"
          onClick={() => member && onDelete(member)}
        >
          <Trash2 className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
          Delete
        </button>
        <button
          type="button"
          className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-1.5"
          onClick={() => member && onEdit(member)}
        >
          <Edit2 className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
          Edit Member
        </button>
      </div>
    </Modal>
  );
};

export default ViewMemberModal;

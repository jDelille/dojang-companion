import { Copy, Edit2, RefreshCw, UserPlus } from "lucide-react";
import Modal from "../../../components/common/Modal";
import type { MembershipPlan } from "../../../types/membershipPlans";
import { PLAN_STATUS_BADGE } from "../../../utils/json/membershipPlansData";
import { moneyWhole } from "../../../utils/formatUtils";

/*
   Plan Details — ported from #modal-view-plan in
   tailwind/src/membership-plans.html and viewPlan() in
   assets/js/membership-plans.js.
*/

type ViewPlanModalProps = {
  plan: MembershipPlan | null;
  onClose: () => void;
  onAssign: (plan: MembershipPlan) => void;
  onRenew: (plan: MembershipPlan) => void;
  onDuplicate: (plan: MembershipPlan) => void;
  onEdit: (plan: MembershipPlan) => void;
};

const ViewPlanModal = ({
  plan,
  onClose,
  onAssign,
  onRenew,
  onDuplicate,
  onEdit,
}: ViewPlanModalProps) => (
  <Modal
    open={plan !== null}
    onClose={onClose}
    title="Plan Details"
    boxClassName="glass modal-w-440"
    closeClassName="modal-x"
    titleClassName="text-base"
    headerClassName="mb-4"
  >
    <div className="gold-border-card p-5 mb-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl emoji-tile text-2xl">{plan?.emoji ?? "⭐"}</div>
          <div>
            <div className="text-lg font-black c-text">{plan?.name ?? "—"}</div>
            <div className="text-[11px] c-dim">{plan?.cat ?? "—"}</div>
          </div>
        </div>
        <span
          className={`${plan ? PLAN_STATUS_BADGE[plan.status] : "badge-active"} text-[10px] font-bold px-2.5 py-0.5 rounded-full`}
        >
          {plan?.status ?? "Active"}
        </span>
      </div>
      <div className="flex items-end gap-2 mt-3">
        <span className="text-2xl font-black gt">{plan ? moneyWhole(plan.price) : "$0"}</span>
        <span className="text-xs mb-1 c-dim">/ {plan?.dur ?? "—"}</span>
      </div>
      <div className="grid grid-cols-2 gap-3 mt-4 pt-4 bd-t">
        <div>
          <div className="text-lg font-black c-text">{plan?.members ?? 0}</div>
          <div className="text-[10px] c-dim">Active Members</div>
        </div>
        <div>
          {/* Revenue is price × subscribers, as in viewPlan(). */}
          <div className="text-lg font-black c-text">
            {plan ? moneyWhole(plan.price * plan.members) : "$0"}
          </div>
          <div className="text-[10px] c-dim">Monthly Revenue</div>
        </div>
      </div>
      <div className="mt-4 pt-4 bd-t">
        <div className="f-label">Features</div>
        <div className="flex flex-wrap gap-1.5">
          {plan?.feat.map((feature) => (
            <span key={feature} className="text-[11px] px-2 py-1 rounded-lg feat-chip">
              {feature}
            </span>
          ))}
        </div>
      </div>
    </div>
    <div className="flex gap-2 mb-2">
      <button
        type="button"
        className="btn-ghost flex-1 py-2.5 text-sm flex items-center justify-center gap-1.5"
        onClick={() => plan && onAssign(plan)}
      >
        <UserPlus className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
        Assign
      </button>
      <button
        type="button"
        className="btn-ghost flex-1 py-2.5 text-sm flex items-center justify-center gap-1.5"
        onClick={() => plan && onRenew(plan)}
      >
        <RefreshCw className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
        Renew
      </button>
      <button
        type="button"
        className="btn-ghost flex-1 py-2.5 text-sm flex items-center justify-center gap-1.5"
        onClick={() => plan && onDuplicate(plan)}
      >
        <Copy className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
        Duplicate
      </button>
    </div>
    <div className="flex gap-2">
      <button
        type="button"
        className="btn-ghost flex-1 py-2.5 text-sm flex items-center justify-center gap-1.5"
        onClick={() => plan && onEdit(plan)}
      >
        <Edit2 className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
        Edit
      </button>
      <button type="button" className="btn-gold flex-1 py-2.5 text-sm" onClick={onClose}>
        Close
      </button>
    </div>
  </Modal>
);

export default ViewPlanModal;

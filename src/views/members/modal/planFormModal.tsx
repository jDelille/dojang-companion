import { useEffect, useState } from "react";
import { Star, X } from "lucide-react";
import CommonSelect from "../../../components/common-select/commonSelect";
import type { MembershipPlan, PlanCategory, PlanStatus } from "../../../types/membershipPlans";
import {
  CATEGORY_OPTIONS,
  PLAN_STATUS_OPTIONS,
} from "../../../utils/json/membershipPlansData";
import type { PlanFormInput } from "../useMembershipPlans";
import DialogEyebrow from "@/components/common/DialogEyebrow";

/*
   Add / Edit Plan — ported from #modal-add-plan in
   tailwind/src/membership-plans.html and openAddPlan()/openEditPlan()/
   savePlan() in assets/js/membership-plans.js.

   One modal serves both modes, as in the template: the title switches and the
   fields seed from the plan being edited. Raw markup rather than
   components/common/Modal because the header carries a gold icon tile.
*/

const toOptions = (values: readonly string[]) =>
  values.map((value) => ({ value, label: value }));

type PlanFormModalProps = {
  open: boolean;
  /** The plan being edited, or null when adding. */
  plan: MembershipPlan | null;
  onClose: () => void;
  onSave: (input: PlanFormInput) => void;
  /** Called instead of onSave when the name is blank. */
  onInvalid: () => void;
};

const PlanFormModal = ({ open, plan, onClose, onSave, onInvalid }: PlanFormModalProps) => {
  const [name, setName] = useState(plan?.name ?? "");
  const [price, setPrice] = useState(plan ? String(plan.price) : "");
  const [dur, setDur] = useState(plan?.dur ?? "");
  const [cat, setCat] = useState<PlanCategory>(plan?.cat ?? "Gym");
  const [status, setStatus] = useState<PlanStatus>(plan?.status ?? "Active");
  const [feat, setFeat] = useState(plan ? plan.feat.join(", ") : "");

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  const save = () => {
    const trimmed = name.trim();
    // savePlan() toasted "Enter a plan name" and kept the modal open.
    if (!trimmed) {
      onInvalid();
      return;
    }
    onSave({
      id: plan?.id ?? null,
      name: trimmed,
      price: parseFloat(price) || 0,
      dur: dur.trim() || "1 month",
      cat,
      status,
      feat,
    });
    onClose();
  };

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
      <div className="modal-box glass">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="icon-box w-9! h-9! grad-gold">
              <Star className="w-[17px] h-[17px] t-ink shrink-0" aria-hidden="true" />
            </div>
            <DialogEyebrow />
            <h3 className="text-base font-black c-text">
              {plan ? "Edit Plan" : "Add New Plan"}
            </h3>
          </div>
          <button type="button" className="modal-x" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="f-label">Plan Name</label>
            <input
              type="text"
              className="fp-input py-2.5 text-sm"
              placeholder="e.g. Annual Premium"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="f-label">Price ($)</label>
            <input
              type="number"
              className="fp-input py-2.5 text-sm"
              placeholder="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
          <div>
            <label className="f-label">Duration</label>
            <input
              type="text"
              className="fp-input py-2.5 text-sm"
              placeholder="e.g. 12 months"
              value={dur}
              onChange={(e) => setDur(e.target.value)}
            />
          </div>
          <div>
            <label className="f-label">Category</label>
            <CommonSelect
              fieldClassName="py-2.5 text-sm"
              ariaLabel="Category"
              options={toOptions(CATEGORY_OPTIONS)}
              value={cat}
              onChange={(option) => setCat((option?.value as PlanCategory) ?? "Gym")}
            />
          </div>
          <div>
            <label className="f-label">Status</label>
            <CommonSelect
              fieldClassName="py-2.5 text-sm"
              ariaLabel="Status"
              options={toOptions(PLAN_STATUS_OPTIONS)}
              value={status}
              onChange={(option) => setStatus((option?.value as PlanStatus) ?? "Active")}
            />
          </div>
          <div className="col-span-2">
            <label className="f-label">Features (comma separated)</label>
            <input
              type="text"
              className="fp-input py-2.5 text-sm"
              placeholder="Gym access, Locker, 2 PT sessions"
              value={feat}
              onChange={(e) => setFeat(e.target.value)}
            />
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn-gold flex-1 py-2.5 text-sm" onClick={save}>
            Save Plan
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlanFormModal;

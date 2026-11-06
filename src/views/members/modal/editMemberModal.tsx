import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import CommonSelect from "../../../components/common-select/commonSelect";
import CommonDatePicker from "../../../components/common-date-picker/commonDatePicker";
import type { Member, MemberStatus, PlanLabel } from "../../../types/members";
import { PLAN_OPTIONS, TRAINER_OPTIONS } from "../../../utils/json/membersData";
import type { EditMemberInput } from "../useMembers";
import DialogEyebrow from "@/components/common/DialogEyebrow";

/*
   Edit Member — ported from #modal-edit-member in tailwind/src/members.html
   and openEdit()/saveEdit() in assets/js/members.js.

   Raw markup rather than components/common/Modal: the header carries the
   member's avatar and id beside the title.
*/

const toOptions = (values: readonly string[]) =>
  values.map((value) => ({ value, label: value }));

const STATUS_OPTIONS = toOptions(["Active", "Expiring", "Expired", "Frozen"]);

/** "2027-01-15" <-> Date, keeping the stored value's shape on save. */
const toDate = (value: string): Date | null => {
  const parsed = new Date(value + "T00:00:00");
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};
const toValue = (date: Date | null): string =>
  date ? date.toISOString().slice(0, 10) : "";

type EditMemberModalProps = {
  member: Member | null;
  onClose: () => void;
  onSave: (input: EditMemberInput) => void;
};

const EditMemberModal = ({ member, onClose, onSave }: EditMemberModalProps) => {
  const open = member !== null;
  const [first, setFirst] = useState(member?.first ?? "");
  const [last, setLast] = useState(member?.last ?? "");
  const [phone, setPhone] = useState(member && member.phone !== "—" ? member.phone : "");
  const [email, setEmail] = useState(member && member.email !== "—" ? member.email : "");
  const [plan, setPlan] = useState<PlanLabel>(member?.planLabel ?? "Annual Premium");
  const [trainer, setTrainer] = useState(
    member && member.trainer !== "—" ? member.trainer : "None",
  );
  const [status, setStatus] = useState<MemberStatus>(member?.status ?? "Active");
  const [expiry, setExpiry] = useState<Date | null>(toDate(member?.expiry ?? ""));

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
    if (!member) return;
    onSave({
      id: member.id,
      first,
      last,
      phone,
      email,
      plan,
      trainer,
      status,
      expiry: toValue(expiry),
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
      <div className="modal-box">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center text-sm font-black ${member?.av ?? "av-gold"}`}
            >
              {member?.ini ?? "EM"}
            </div>
            <div>
              <DialogEyebrow />
              <h3 className="font-black c-text text-lg leading-none">Edit Member</h3>
              <div className="text-[11px] mt-1 c-dim">ID: {member?.id ?? "M-0000"}</div>
            </div>
          </div>
          <button type="button" className="modal-x" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="f-label">First Name</label>
            <input
              type="text"
              className="fp-input"
              value={first}
              onChange={(e) => setFirst(e.target.value)}
            />
          </div>
          <div>
            <label className="f-label">Last Name</label>
            <input
              type="text"
              className="fp-input"
              value={last}
              onChange={(e) => setLast(e.target.value)}
            />
          </div>
          <div>
            <label className="f-label">Phone</label>
            <input
              type="text"
              className="fp-input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div>
            <label className="f-label">Email</label>
            <input
              type="text"
              className="fp-input"
              placeholder="member@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="f-label">Plan</label>
            <CommonSelect
              ariaLabel="Plan"
              options={toOptions(PLAN_OPTIONS)}
              value={plan}
              onChange={(option) => setPlan((option?.value as PlanLabel) ?? "Annual Premium")}
            />
          </div>
          <div>
            <label className="f-label">Trainer</label>
            <CommonSelect
              ariaLabel="Trainer"
              options={toOptions(TRAINER_OPTIONS)}
              value={trainer}
              onChange={(option) => setTrainer(option?.value ?? "None")}
            />
          </div>
          <div>
            <label className="f-label">Status</label>
            <CommonSelect
              ariaLabel="Status"
              options={STATUS_OPTIONS}
              value={status}
              onChange={(option) => setStatus((option?.value as MemberStatus) ?? "Active")}
            />
          </div>
          <div>
            <label className="f-label">Expiry Date</label>
            <CommonDatePicker
              dateFormat="d M, yy"
              ariaLabel="Expiry date"
              value={expiry}
              onChange={(e) => setExpiry((e.value as Date) ?? null)}
            />
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-1.5"
            onClick={save}
          >
            <Check className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditMemberModal;

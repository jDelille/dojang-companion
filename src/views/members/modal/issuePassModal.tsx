import { useState, type FormEvent } from "react";
import { Ticket } from "lucide-react";
import Modal from "../../../components/common/Modal";
import CommonSelect from "../../../components/common-select/commonSelect";
import type { PassTypeName } from "../../../types/dayPasses";
import { PASS_TYPES } from "../../../utils/json/dayPassesData";
import { moneyWhole } from "../../../utils/formatUtils";
import { feeOf, type IssuePassInput } from "../useDayPasses";

/*
   Issue Day Pass — ported from #modal-issue in tailwind/src/day-passes.html
   and openIssue() plus the #issue-form submit handler in
   assets/js/day-passes.js.

   The fee readout tracks the selected type, as the template's change
   listener on #i-type did.
*/

const TYPE_OPTIONS = PASS_TYPES.map((type) => ({
  value: type.name,
  label: `${type.name} — ${type.fee ? moneyWhole(type.fee) : "Free"}`,
}));

type IssuePassModalProps = {
  open: boolean;
  onClose: () => void;
  onIssue: (input: IssuePassInput) => void;
};

const IssuePassModal = ({ open, onClose, onIssue }: IssuePassModalProps) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [type, setType] = useState<PassTypeName>(PASS_TYPES[0].name);
  const [ref, setRef] = useState("");

  const fee = feeOf(type);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onIssue({ name, phone, type, ref });
    setName("");
    setPhone("");
    setType(PASS_TYPES[0].name);
    setRef("");
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Issue Day Pass"
      boxClassName="glass"
      titleClassName="text-base"
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold mb-1.5 c-text2">Guest Name</label>
            <input
              type="text"
              className="fp-input py-2.5 text-sm"
              placeholder="Full name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1.5 c-text2">Phone</label>
            <input
              type="text"
              className="fp-input py-2.5 text-sm"
              placeholder="(512) 555-0142"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold mb-1.5 c-text2">Pass Type</label>
            <CommonSelect
              fieldClassName="py-2.5 text-sm"
              ariaLabel="Pass type"
              options={TYPE_OPTIONS}
              value={type}
              onChange={(option) =>
                setType((option?.value as PassTypeName) ?? PASS_TYPES[0].name)
              }
            />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1.5 c-text2">
              Referred By (optional)
            </label>
            <input
              type="text"
              className="fp-input py-2.5 text-sm"
              placeholder="Member name"
              value={ref}
              onChange={(e) => setRef(e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-center justify-between p-3 rounded-xl bg-card2">
          <span className="text-[13px] c-dim">Pass fee</span>
          <span className="text-base font-black gt">{fee ? moneyWhole(fee) : "Free"}</span>
        </div>
        <div className="flex gap-3 pt-1">
          <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            type="submit"
            className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
          >
            <Ticket className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            Issue &amp; Check In
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default IssuePassModal;

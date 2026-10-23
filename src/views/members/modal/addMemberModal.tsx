import { useState, type FormEvent } from "react";
import Modal from "../../../components/common/Modal";
import CommonSelect from "../../../components/common-select/commonSelect";
import type { PlanLabel } from "../../../types/members";
import { PLAN_OPTIONS, TRAINER_OPTIONS } from "../../../utils/json/membersData";
import type { NewMemberInput } from "../useMembers";

/*
   Add New Member — ported from #modal-add-member in tailwind/src/members.html
   and addMember() in assets/js/members.js.
*/

const toOptions = (values: readonly string[]) =>
  values.map((value) => ({ value, label: value }));

type AddMemberModalProps = {
  open: boolean;
  onClose: () => void;
  onAdd: (input: NewMemberInput) => void;
};

const AddMemberModal = ({ open, onClose, onAdd }: AddMemberModalProps) => {
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [plan, setPlan] = useState<PlanLabel>("Annual Premium");
  const [trainer, setTrainer] = useState("None");

  const submit = () => {
    // The template focused the field and bailed when first name was empty.
    if (!first.trim()) return;
    onAdd({ first, last, phone, email, plan, trainer });
    setFirst("");
    setLast("");
    setPhone("");
    setEmail("");
    setPlan("Annual Premium");
    setTrainer("None");
    onClose();
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submit();
  };

  return (
    <Modal open={open} onClose={onClose} title="Add New Member" closeClassName="modal-x">
      <form className="grid grid-cols-2 gap-3" onSubmit={handleSubmit}>
        <div>
          <label className="f-label">First Name</label>
          <input
            type="text"
            className="fp-input"
            placeholder="Ashley"
            required
            value={first}
            onChange={(e) => setFirst(e.target.value)}
          />
        </div>
        <div>
          <label className="f-label">Last Name</label>
          <input
            type="text"
            className="fp-input"
            placeholder="Bennett"
            value={last}
            onChange={(e) => setLast(e.target.value)}
          />
        </div>
        <div>
          <label className="f-label">Phone</label>
          <input
            type="text"
            className="fp-input"
            placeholder="(512) 555-0142"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <div>
          <label className="f-label">Email</label>
          <input
            type="email"
            className="fp-input"
            placeholder="ashley@example.com"
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
        <button type="submit" className="sr-only">
          Add Member
        </button>
      </form>
      <div className="flex gap-3 mt-5">
        <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
          Cancel
        </button>
        <button type="button" className="btn-gold flex-1 py-2.5 text-sm" onClick={submit}>
          Add Member
        </button>
      </div>
    </Modal>
  );
};

export default AddMemberModal;

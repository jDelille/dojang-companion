import { useState, type FormEvent } from "react";
import { Check } from "lucide-react";
import Modal from "../../../components/common/Modal";
import CommonSelect from "../../../components/common-select/commonSelect";
import type { LeadInterest, LeadSource, LeadTemp } from "../../../types/leads";
import { INTEREST_OPTIONS, SOURCE_OPTIONS, TEMP_OPTIONS } from "../../../utils/json/leadsData";
import type { NewLeadInput } from "../useLeads";

/*
   Add Lead — ported from #modal-add in tailwind/src/leads.html and the
   #add-form submit handler in assets/js/leads.js.
*/

const toOptions = (values: readonly string[]) =>
  values.map((value) => ({ value, label: value }));

type AddLeadModalProps = {
  open: boolean;
  onClose: () => void;
  onAdd: (input: NewLeadInput) => void;
};

const AddLeadModal = ({ open, onClose, onAdd }: AddLeadModalProps) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [interest, setInterest] = useState<LeadInterest>("Monthly Membership");
  const [source, setSource] = useState<LeadSource>("Walk-in");
  const [temp, setTemp] = useState<LeadTemp>("Hot");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onAdd({ name, phone, interest, source, temp });
    setName("");
    setPhone("");
    setInterest("Monthly Membership");
    setSource("Walk-in");
    setTemp("Hot");
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add Lead"
      boxClassName="glass"
      titleClassName="text-base"
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold mb-1.5 c-text2">Name</label>
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
            <label className="block text-xs font-bold mb-1.5 c-text2">Interest</label>
            <CommonSelect
              fieldClassName="py-2.5 text-sm"
              ariaLabel="Interest"
              options={toOptions(INTEREST_OPTIONS)}
              value={interest}
              onChange={(option) =>
                setInterest((option?.value as LeadInterest) ?? "Monthly Membership")
              }
            />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1.5 c-text2">Source</label>
            <CommonSelect
              fieldClassName="py-2.5 text-sm"
              ariaLabel="Source"
              options={toOptions(SOURCE_OPTIONS)}
              value={source}
              onChange={(option) => setSource((option?.value as LeadSource) ?? "Walk-in")}
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold mb-1.5 c-text2">Temperature</label>
          <CommonSelect
            fieldClassName="py-2.5 text-sm"
            ariaLabel="Temperature"
            options={toOptions(TEMP_OPTIONS)}
            value={temp}
            onChange={(option) => setTemp((option?.value as LeadTemp) ?? "Hot")}
          />
        </div>
        <div className="flex gap-3 pt-1">
          <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            type="submit"
            className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
          >
            <Check className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            Add Lead
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddLeadModal;

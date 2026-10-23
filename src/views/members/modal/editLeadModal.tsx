import { useState, type FormEvent } from "react";
import { Check } from "lucide-react";
import Modal from "../../../components/common/Modal";
import CommonSelect from "../../../components/common-select/commonSelect";
import type { Lead, LeadInterest, LeadSource, LeadTemp } from "../../../types/leads";
import {
  INTEREST_OPTIONS,
  OWNERS,
  SOURCE_OPTIONS,
  TEMP_OPTIONS,
} from "../../../utils/json/leadsData";
import type { EditLeadInput } from "../useLeads";

/*
   Edit Lead — ported from #modal-edit in tailwind/src/leads.html and
   openEdit()/saveEdit() in assets/js/leads.js.

   Seeded from the lead on mount; the page keys this component by lead id so a
   different lead remounts it with fresh values.
*/

const toOptions = (values: readonly string[]) =>
  values.map((value) => ({ value, label: value }));

type EditLeadModalProps = {
  lead: Lead | null;
  onClose: () => void;
  onSave: (input: EditLeadInput) => void;
};

const EditLeadModal = ({ lead, onClose, onSave }: EditLeadModalProps) => {
  const [name, setName] = useState(lead?.name ?? "");
  const [phone, setPhone] = useState(lead && lead.phone !== "—" ? lead.phone : "");
  const [email, setEmail] = useState(lead && lead.email !== "—" ? lead.email : "");
  const [interest, setInterest] = useState<LeadInterest>(lead?.interest ?? "Monthly Membership");
  const [source, setSource] = useState<LeadSource>(lead?.source ?? "Walk-in");
  const [temp, setTemp] = useState<LeadTemp>(lead?.temp ?? "Hot");
  const [owner, setOwner] = useState(lead?.owner ?? OWNERS[0]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!lead) return;
    onSave({ id: lead.id, name, phone, email, interest, source, temp, owner });
    onClose();
  };

  return (
    <Modal
      open={lead !== null}
      onClose={onClose}
      title="Edit Lead"
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
        <div>
          <label className="block text-xs font-bold mb-1.5 c-text2">Email</label>
          <input
            type="email"
            className="fp-input py-2.5 text-sm"
            placeholder="name@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
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
        <div className="grid grid-cols-2 gap-3">
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
          <div>
            <label className="block text-xs font-bold mb-1.5 c-text2">Owner</label>
            <CommonSelect
              fieldClassName="py-2.5 text-sm"
              ariaLabel="Owner"
              options={toOptions(OWNERS)}
              value={owner}
              onChange={(option) => setOwner(option?.value ?? OWNERS[0])}
            />
          </div>
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
            Save Changes
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditLeadModal;

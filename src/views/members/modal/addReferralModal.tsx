import { useState, type FormEvent } from "react";
import { Send } from "lucide-react";
import Modal from "../../../components/common/Modal";
import CommonSelect from "../../../components/common-select/commonSelect";
import { REFERRING_MEMBERS } from "../../../utils/json/referralsData";

/*
   Add Referral — ported from #modal-add in tailwind/src/referrals.html and
   the #add-form submit handler in assets/js/referrals.js.
*/

const MEMBER_OPTIONS = REFERRING_MEMBERS.map((value) => ({ value, label: value }));

type AddReferralModalProps = {
  open: boolean;
  onClose: () => void;
  onAdd: (friend: string, by: string, phone: string) => void;
};

const AddReferralModal = ({ open, onClose, onAdd }: AddReferralModalProps) => {
  const [by, setBy] = useState(REFERRING_MEMBERS[0]);
  const [friend, setFriend] = useState("");
  const [phone, setPhone] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onAdd(friend, by, phone);
    setBy(REFERRING_MEMBERS[0]);
    setFriend("");
    setPhone("");
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add Referral"
      boxClassName="glass"
      titleClassName="text-base"
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-xs font-bold mb-1.5 c-text2">
            Referred By (member)
          </label>
          <CommonSelect
            fieldClassName="py-2.5 text-sm"
            ariaLabel="Referred by"
            options={MEMBER_OPTIONS}
            value={by}
            onChange={(option) => setBy(option?.value ?? REFERRING_MEMBERS[0])}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold mb-1.5 c-text2">
              Friend&apos;s Name
            </label>
            <input
              type="text"
              className="fp-input py-2.5 text-sm"
              placeholder="Full name"
              required
              value={friend}
              onChange={(e) => setFriend(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1.5 c-text2">
              Friend&apos;s Phone
            </label>
            <input
              type="text"
              className="fp-input py-2.5 text-sm"
              placeholder="(512) 555-0142"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
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
            <Send className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            Send Invite
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddReferralModal;

import { useEffect, useState } from "react";
import { Edit2, X } from "lucide-react";
import CommonSelect from "../../../components/common-select/commonSelect";
import type { Referral, ReferralStatus } from "../../../types/referrals";
import {
  REFERRAL_STATUS_OPTIONS,
  REFERRING_MEMBERS,
} from "../../../utils/json/referralsData";
import type { ReferralEditInput } from "../useReferrals";

/*
   Edit Referral — ported from #modal-edit in tailwind/src/referrals.html and
   openEdit()/saveEdit() in assets/js/referrals.js.
*/

const toOptions = (values: readonly string[]) =>
  values.map((value) => ({ value, label: value }));

type EditReferralModalProps = {
  referral: Referral | null;
  onClose: () => void;
  onSave: (input: ReferralEditInput) => void;
};

const EditReferralModal = ({ referral, onClose, onSave }: EditReferralModalProps) => {
  const open = referral !== null;
  const [friend, setFriend] = useState(referral?.friend ?? "");
  const [by, setBy] = useState(referral?.by ?? REFERRING_MEMBERS[0]);
  const [status, setStatus] = useState<ReferralStatus>(referral?.status ?? "Invited");
  const [date, setDate] = useState(referral?.date ?? "");

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
      <div className="modal-box glass modal-w-460">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="icon-box grad-gold ic-38">
              <Edit2 className="w-[17px] h-[17px] t-ink shrink-0" aria-hidden="true" />
            </div>
            <h3 className="text-base font-black c-text">Edit Referral</h3>
          </div>
          <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="f-label">Referred Friend</label>
            <input
              type="text"
              className="fp-input py-2.5 text-sm"
              value={friend}
              onChange={(e) => setFriend(e.target.value)}
            />
          </div>
          <div>
            <label className="f-label">Referred By</label>
            <CommonSelect
              fieldClassName="py-2.5 text-sm"
              ariaLabel="Referred by"
              options={toOptions(REFERRING_MEMBERS)}
              value={by}
              onChange={(option) => setBy(option?.value ?? REFERRING_MEMBERS[0])}
            />
          </div>
          <div>
            <label className="f-label">Status</label>
            <CommonSelect
              fieldClassName="py-2.5 text-sm"
              ariaLabel="Status"
              options={toOptions(REFERRAL_STATUS_OPTIONS)}
              value={status}
              onChange={(option) =>
                setStatus((option?.value as ReferralStatus) ?? "Invited")
              }
            />
          </div>
          <div className="col-span-2">
            <label className="f-label">Date</label>
            <input
              type="text"
              className="fp-input py-2.5 text-sm"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-gold flex-1 py-2.5 text-sm"
            onClick={() =>
              referral && onSave({ id: referral.id, friend, by, status, date })
            }
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditReferralModal;

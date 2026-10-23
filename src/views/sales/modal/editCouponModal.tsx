import { useState, type FormEvent } from "react";
import { Check } from "lucide-react";
import Modal from "../../../components/common/Modal";
import CommonSelect from "../../../components/common-select/commonSelect";
import type { Coupon, CouponStatus, CouponType } from "../../../types/sales";
import type { EditCouponInput } from "../useOffers";

/*
   Edit Coupon — ported from #modal-edit in tailwind/src/offers.html and
   openEdit()/saveEdit() in assets/js/offers.js.

   The code field is read-only: it identifies the record being edited.
*/

const TYPE_OPTIONS = [
  { value: "percent", label: "Percentage (%)" },
  { value: "flat", label: "Flat ($)" },
];

const STATUS_OPTIONS = [
  { value: "Active", label: "Active" },
  { value: "Scheduled", label: "Scheduled" },
  { value: "Expired", label: "Expired" },
];

type EditCouponModalProps = {
  coupon: Coupon | null;
  onClose: () => void;
  onSave: (input: EditCouponInput) => void;
};

/*
   Seeded from the coupon on mount. The parent keys this component by coupon
   code, so opening a different coupon remounts it with fresh values —
   preferable to re-seeding from an effect.
*/
const EditCouponModal = ({ coupon, onClose, onSave }: EditCouponModalProps) => {
  const [title, setTitle] = useState(coupon?.title ?? "");
  const [type, setType] = useState<CouponType>(coupon?.type ?? "percent");
  const [value, setValue] = useState(coupon ? String(coupon.value) : "");
  const [limit, setLimit] = useState(coupon ? String(coupon.limit) : "");
  const [status, setStatus] = useState<CouponStatus>(coupon?.status ?? "Active");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!coupon) return;
    onSave({
      code: coupon.code,
      title,
      type,
      value: Number(value) || 0,
      limit: Number(limit) || 0,
      status,
    });
    onClose();
  };

  return (
    <Modal
      open={coupon !== null}
      onClose={onClose}
      title="Edit Coupon"
      titleClassName="text-base"
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold mb-1.5 c-text2">Coupon code</label>
            <input
              type="text"
              className="fp-input py-2.5 text-sm uppercase"
              disabled
              value={coupon?.code ?? ""}
              readOnly
            />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1.5 c-text2">Title</label>
            <input
              type="text"
              className="fp-input py-2.5 text-sm"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold mb-1.5 c-text2">Discount type</label>
            <CommonSelect
              fieldClassName="py-2.5 text-sm"
              ariaLabel="Discount type"
              options={TYPE_OPTIONS}
              value={type}
              onChange={(option) => setType((option?.value as CouponType) ?? "percent")}
            />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1.5 c-text2">Value</label>
            <input
              type="number"
              min="1"
              className="fp-input py-2.5 text-sm"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold mb-1.5 c-text2">Usage limit</label>
            <input
              type="number"
              min="1"
              className="fp-input py-2.5 text-sm"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1.5 c-text2">Status</label>
            <CommonSelect
              fieldClassName="py-2.5 text-sm"
              ariaLabel="Status"
              options={STATUS_OPTIONS}
              value={status}
              onChange={(option) => setStatus((option?.value as CouponStatus) ?? "Active")}
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

export default EditCouponModal;

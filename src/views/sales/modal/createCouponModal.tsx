import { useState, type FormEvent } from "react";
import { Check } from "lucide-react";
import Modal from "../../../components/common/Modal";
import CommonSelect from "../../../components/common-select/commonSelect";
import CommonDatePicker from "../../../components/common-date-picker/commonDatePicker";
import type { CouponType } from "../../../types/sales";
import type { CreateCouponInput } from "../useOffers";

/*
   Create Coupon — ported from #modal-create in tailwind/src/offers.html and
   the #create-form submit handler in assets/js/offers.js.
*/

const TYPE_OPTIONS = [
  { value: "percent", label: "Percentage (%)" },
  { value: "flat", label: "Flat ($)" },
];

type CreateCouponModalProps = {
  open: boolean;
  onClose: () => void;
  onCreate: (input: CreateCouponInput) => void;
};

const CreateCouponModal = ({ open, onClose, onCreate }: CreateCouponModalProps) => {
  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  const [type, setType] = useState<CouponType>("percent");
  const [value, setValue] = useState("");
  const [limit, setLimit] = useState("");
  const [expiry, setExpiry] = useState<Date | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onCreate({
      code,
      title,
      type,
      value: Number(value) || 0,
      limit: Number(limit) || 0,
      expiry,
    });
    setCode("");
    setTitle("");
    setType("percent");
    setValue("");
    setLimit("");
    setExpiry(null);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Create Coupon" titleClassName="text-base">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold mb-1.5 c-text2">Coupon code</label>
            <input
              type="text"
              className="fp-input py-2.5 text-sm uppercase"
              placeholder="SUMMER25"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1.5 c-text2">Title</label>
            <input
              type="text"
              className="fp-input py-2.5 text-sm"
              placeholder="Summer Sale"
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
              placeholder="25"
              required
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
              placeholder="100"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1.5 c-text2">Expires</label>
            <CommonDatePicker
              className="py-2.5 text-sm"
              dateFormat="d M, yy"
              ariaLabel="Expiry date"
              placeholder="12/10/2025"
              value={expiry}
              onChange={(e) => setExpiry((e.value as Date) ?? null)}
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
            Create Coupon
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateCouponModal;

import { useState } from "react";
import PosModal from "../posModal";

/*
   Coupon Code, ported from #modal-coupon / applyCoupon() in
   tailwind/src/pos.html and assets/js/pos.js.

   Only FITPRO20 is valid in the template data; anything else marks the field
   rather than closing, so the cashier can correct a typo in place.
*/

const VALID_CODE = "FITPRO20";

type CouponModalProps = {
  open: boolean;
  onClose: () => void;
  onApply: (code: string) => void;
};

const CouponModal = ({ open, onClose, onApply }: CouponModalProps) => {
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);

  const submit = () => {
    if (code.trim().toUpperCase() !== VALID_CODE) {
      setError(true);
      return;
    }
    setError(false);
    onApply(VALID_CODE);
    onClose();
  };

  return (
    <PosModal open={open} onClose={onClose} title="Coupon Code">
      <div className={error ? "field has-error" : "field"}>
        <label className="field-label">Enter Coupon</label>
        <input
          type="text"
          className="fp-input py-2.5 text-sm uppercase"
          placeholder={VALID_CODE}
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            setError(false);
          }}
        />
        <div className="field-err">Invalid or expired coupon code.</div>
      </div>
      <div className="text-[11px] t-muted mb-1">
        Try <span className="t-gold font-bold">{VALID_CODE}</span> for 20% off.
      </div>
      <div className="modal-actions">
        <button
          type="button"
          className="btn-ghost ripple flex-1 py-2.5 text-sm"
          onClick={onClose}
        >
          Cancel
        </button>
        <button
          type="button"
          className="btn-gold ripple flex-1 py-2.5 text-sm"
          onClick={submit}
        >
          Redeem
        </button>
      </div>
    </PosModal>
  );
};

export default CouponModal;

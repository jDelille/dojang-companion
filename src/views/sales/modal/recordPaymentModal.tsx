import { useState, type FormEvent } from "react";
import { Check } from "lucide-react";
import Modal from "../../../components/common/Modal";
import CommonSelect from "../../../components/common-select/commonSelect";
import CommonDatePicker from "../../../components/common-date-picker/commonDatePicker";
import type { TxnMethod } from "../../../types/sales";
import { METHOD_ORDER } from "../../../utils/json/salesData";
import type { RecordPaymentInput } from "../usePayments";

/*
   Record Payment — ported from #modal-record in tailwind/src/payments.html
   and the #record-form submit handler in assets/js/payments.js.
*/

const METHOD_OPTIONS = METHOD_ORDER.map((method) => ({ value: method, label: method }));

/* The template ships the form pre-filled with this date. */
const DEFAULT_DATE = new Date(2026, 6, 14);

type RecordPaymentModalProps = {
  open: boolean;
  onClose: () => void;
  onRecord: (input: RecordPaymentInput) => void;
};

const RecordPaymentModal = ({ open, onClose, onRecord }: RecordPaymentModalProps) => {
  const [customer, setCustomer] = useState("");
  const [date, setDate] = useState<Date | null>(DEFAULT_DATE);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<TxnMethod>("Cash");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onRecord({ customer, date, amount: Number(amount) || 0, method });
    setCustomer("");
    setDate(DEFAULT_DATE);
    setAmount("");
    setMethod("Cash");
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Record Payment" titleClassName="text-base">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-xs font-bold mb-1.5 c-text2">Customer</label>
          <input
            type="text"
            className="fp-input py-2.5 text-sm"
            placeholder="Full name"
            required
            value={customer}
            onChange={(e) => setCustomer(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-bold mb-1.5 c-text2">Date</label>
          <CommonDatePicker
            className="py-2.5 text-sm"
            dateFormat="d M, yy"
            ariaLabel="Payment date"
            placeholder="Select date"
            value={date}
            onChange={(e) => setDate((e.value as Date) ?? null)}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold mb-1.5 c-text2">Amount ($)</label>
            <input
              type="number"
              min="1"
              className="fp-input py-2.5 text-sm"
              placeholder="0"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1.5 c-text2">Method</label>
            <CommonSelect
              fieldClassName="py-2.5 text-sm"
              ariaLabel="Payment method"
              options={METHOD_OPTIONS}
              value={method}
              onChange={(option) => setMethod((option?.value as TxnMethod) ?? "Cash")}
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
            Record
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default RecordPaymentModal;

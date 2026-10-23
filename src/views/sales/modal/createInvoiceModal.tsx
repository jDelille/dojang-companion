import { useState, type FormEvent } from "react";
import { Check } from "lucide-react";
import Modal from "../../../components/common/Modal";
import CommonSelect from "../../../components/common-select/commonSelect";
import CommonDatePicker from "../../../components/common-date-picker/commonDatePicker";
import type { InvoiceStatus } from "../../../types/sales";
import type { CreateInvoiceInput } from "../useInvoices";

/*
   Create Invoice — ported from #modal-create in tailwind/src/invoices.html
   and createInvoice() in assets/js/invoices.js.

   The template read values off the form element on submit; here each field is
   controlled so the form can be reset after a successful create.
*/

const STATUS_OPTIONS = [
  { value: "Unpaid", label: "Unpaid" },
  { value: "Paid", label: "Paid" },
  { value: "Draft", label: "Draft" },
];

type CreateInvoiceModalProps = {
  open: boolean;
  onClose: () => void;
  onCreate: (input: CreateInvoiceInput) => void;
};

const CreateInvoiceModal = ({ open, onClose, onCreate }: CreateInvoiceModalProps) => {
  const [customer, setCustomer] = useState("");
  const [email, setEmail] = useState("");
  const [item, setItem] = useState("");
  const [amount, setAmount] = useState("");
  const [due, setDue] = useState<Date | null>(null);
  const [status, setStatus] = useState<InvoiceStatus>("Unpaid");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onCreate({ customer, email, item, amount: Number(amount) || 0, due, status });
    setCustomer("");
    setEmail("");
    setItem("");
    setAmount("");
    setDue(null);
    setStatus("Unpaid");
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create Invoice"
      boxClassName="modal-w-480"
      titleClassName="text-base"
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-3">
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
            <label className="block text-xs font-bold mb-1.5 c-text2">Email</label>
            <input
              type="email"
              className="fp-input py-2.5 text-sm"
              placeholder="name@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold mb-1.5 c-text2">Item / Description</label>
            <input
              type="text"
              className="fp-input py-2.5 text-sm"
              placeholder="e.g. Annual Membership"
              required
              value={item}
              onChange={(e) => setItem(e.target.value)}
            />
          </div>
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
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold mb-1.5 c-text2">Due Date</label>
            <CommonDatePicker
              className="py-2.5 text-sm"
              dateFormat="d M, yy"
              ariaLabel="Due date"
              value={due}
              onChange={(e) => setDue((e.value as Date) ?? null)}
            />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1.5 c-text2">Status</label>
            <CommonSelect
              fieldClassName="py-2.5 text-sm"
              ariaLabel="Status"
              options={STATUS_OPTIONS}
              value={status}
              onChange={(option) => setStatus((option?.value as InvoiceStatus) ?? "Unpaid")}
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
            Create Invoice
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateInvoiceModal;

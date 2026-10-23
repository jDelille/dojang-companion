import { useState } from "react";
import { Banknote, CheckCircle, CreditCard, Smartphone, Wallet } from "lucide-react";
import Modal from "../../../components/common/Modal";
import type { Member, PayMethod } from "../../../types/members";

/*
   Take Payment — ported from #modal-payment in tailwind/src/members.html and
   openPayment()/openPayMethod()/confirmPayment() in assets/js/members.js.

   The method tiles are a radio group: `.active` marks the selection, which
   the template toggled by hand.
*/

const METHODS: { id: PayMethod; Icon: typeof Banknote }[] = [
  { id: "Cash", Icon: Banknote },
  { id: "Card", Icon: CreditCard },
  { id: "Apple Pay", Icon: Smartphone },
  { id: "Wallet", Icon: Wallet },
];

type PaymentMemberModalProps = {
  member: Member | null;
  onClose: () => void;
  onConfirm: (member: Member, amount: number, method: PayMethod) => void;
};

const PaymentMemberModal = ({ member, onClose, onConfirm }: PaymentMemberModalProps) => {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<PayMethod>("Cash");

  const confirm = () => {
    if (!member) return;
    const value = parseFloat(amount);
    // The template focused the field and bailed on a non-positive amount.
    if (!(value > 0)) return;
    onConfirm(member, value, method);
    setAmount("");
    setMethod("Cash");
  };

  return (
    <Modal
      open={member !== null}
      onClose={onClose}
      title="Take Payment"
      boxClassName="modal-w-400"
      closeClassName="modal-x"
      headerClassName="mb-4"
    >
      <div className="gold-border-card p-3 mb-4">
        <div className="text-sm font-bold c-text">
          {member ? `${member.first} ${member.last}` : "—"}
        </div>
        <div className="text-[11px] c-dim">
          {member ? `${member.id} · ${member.planLabel}` : "—"}
        </div>
      </div>
      <div className="mb-3">
        <label className="f-label">Amount ($)</label>
        <input
          type="number"
          className="fp-input"
          placeholder="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>
      <div className="mb-4">
        <label className="f-label">Method</label>
        <div className="grid grid-cols-4 gap-2">
          {METHODS.map(({ id, Icon }) => (
            <button
              key={id}
              type="button"
              className={id === method ? "pm-method qa-tile active" : "pm-method qa-tile"}
              onClick={() => setMethod(id)}
            >
              <Icon className="shrink-0" aria-hidden="true" />
              <span>{id}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="flex gap-3">
        <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
          Cancel
        </button>
        <button
          type="button"
          className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-1.5"
          onClick={confirm}
        >
          <CheckCircle className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
          Record Payment
        </button>
      </div>
    </Modal>
  );
};

export default PaymentMemberModal;

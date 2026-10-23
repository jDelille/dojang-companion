import { Download, Dumbbell, Printer } from "lucide-react";
import Modal from "../../../components/common/Modal";
import type { Txn } from "../../../types/sales";
import { money } from "../../../utils/salesUtils";

/*
   Receipt — ported from #modal-receipt in tailwind/src/payments.html and
   openReceipt() in assets/js/payments.js.
*/

type ReceiptModalProps = {
  txn: Txn | null;
  onClose: () => void;
  onAction: (message: string) => void;
};

const ReceiptModal = ({ txn, onClose, onAction }: ReceiptModalProps) => (
  <Modal
    open={txn !== null}
    onClose={onClose}
    title="Receipt"
    boxClassName="instyle-38"
    titleClassName="text-base"
    headerClassName="mb-4"
  >
    <div className="rounded-xl p-4 card-dashed-gold">
      <div className="flex items-center justify-center gap-2 mb-1">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-gold-grad">
          <Dumbbell className="w-[14px] h-[14px] c-dark shrink-0" aria-hidden="true" />
        </div>
        <div className="text-sm font-black gt">Dreams GYM</div>
      </div>
      <div className="text-center text-[10px] c-dim mb-3">Austin HQ · EIN 47-1234567</div>
      <div className="flex justify-between text-[11px] c-dim py-1">
        <span>Receipt No.</span>
        <span className="c-text2 font-mono">{txn?.id ?? "—"}</span>
      </div>
      <div className="flex justify-between text-[11px] c-dim py-1">
        <span>Customer</span>
        <span className="c-text2">{txn?.customer ?? "—"}</span>
      </div>
      <div className="flex justify-between text-[11px] c-dim py-1">
        <span>Date</span>
        <span className="c-text2">{txn?.date ?? "—"}</span>
      </div>
      <div className="flex justify-between text-[11px] c-dim py-1">
        <span>Method</span>
        <span className="c-text2">{txn?.method ?? "—"}</span>
      </div>
      <div className="border-dashed-gold" />
      <div className="flex justify-between font-black text-sm">
        <span className="c-text">Amount Paid</span>
        <span className="gt">{txn ? money(txn.amount) : "$0"}</span>
      </div>
      <div className="text-center text-[10px] c-dim mt-3">Thank you for training with us! 💪</div>
    </div>
    <div className="flex gap-2 mt-4">
      <button
        type="button"
        className="btn-ghost flex-1 py-2.5 text-sm flex items-center justify-center gap-1.5"
        onClick={() => onAction("Receipt downloading…")}
      >
        <Download className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
        Download
      </button>
      <button
        type="button"
        className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-1.5"
        onClick={() => onAction("Receipt printing…")}
      >
        <Printer className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
        Print
      </button>
    </div>
  </Modal>
);

export default ReceiptModal;

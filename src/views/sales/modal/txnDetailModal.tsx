import { Receipt, RotateCcw } from "lucide-react";
import Modal from "../../../components/common/Modal";
import type { Txn } from "../../../types/sales";
import { TXN_STATUS_BADGE } from "../../../utils/json/salesData";
import { gatewayRef, initials, money } from "../../../utils/salesUtils";

/*
   Transaction Details — ported from #modal-txn in tailwind/src/payments.html
   and openTxn() in assets/js/payments.js.

   Refunding is only offered for successful transactions; the template dimmed
   and disabled the button otherwise, which is reproduced here.
*/

type TxnDetailModalProps = {
  txn: Txn | null;
  onClose: () => void;
  onReceipt: (txn: Txn) => void;
  onRefund: (txn: Txn) => void;
};

const TxnDetailModal = ({ txn, onClose, onReceipt, onRefund }: TxnDetailModalProps) => {
  const refundable = txn?.status === "Success";

  return (
    <Modal
      open={txn !== null}
      onClose={onClose}
      title="Transaction Details"
      boxClassName="glass modal-w-460"
      titleClassName="text-base"
      headerClassName="mb-4"
    >
      <div className="gold-border-card p-4 mb-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="av av-gold w-12! h-12! text-sm! rounded-xl">
            {txn ? initials(txn.customer) : "--"}
          </div>
          <div className="flex-1">
            <div className="text-sm font-black c-text">{txn?.customer ?? "—"}</div>
            <div className="text-[11px] c-dim font-mono">{txn?.id ?? "—"}</div>
          </div>
          <span className={`badge ${txn ? TXN_STATUS_BADGE[txn.status] : "badge-present"}`}>
            <span className="dot" />
            {txn?.status ?? "—"}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3 pt-3 bd-t">
          <div>
            <div className="text-[10px] c-dim2 font-black uppercase tracking-wider mb-0.5">
              Amount
            </div>
            <div className="text-lg font-black gt">
              {txn ? (txn.status === "Refunded" ? "−" : "") + money(txn.amount) : "$0"}
            </div>
          </div>
          <div>
            <div className="text-[10px] c-dim2 font-black uppercase tracking-wider mb-0.5">
              Method
            </div>
            <div className="text-sm font-semibold c-text">{txn?.method ?? "—"}</div>
          </div>
          <div>
            <div className="text-[10px] c-dim2 font-black uppercase tracking-wider mb-0.5">
              Date &amp; Time
            </div>
            <div className="text-sm font-semibold c-text">{txn?.date ?? "—"}</div>
          </div>
          <div>
            <div className="text-[10px] c-dim2 font-black uppercase tracking-wider mb-0.5">
              Gateway Ref
            </div>
            <div className="text-sm font-semibold c-text font-mono">
              {txn ? gatewayRef(txn.id) : "—"}
            </div>
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          className="btn-ghost flex-1 py-2.5 text-sm flex items-center justify-center gap-1.5"
          onClick={() => txn && onReceipt(txn)}
        >
          <Receipt className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
          Receipt
        </button>
        <button
          type="button"
          className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-1.5"
          style={{ opacity: refundable ? 1 : 0.5 }}
          disabled={!refundable}
          onClick={() => txn && onRefund(txn)}
        >
          <RotateCcw className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
          Refund
        </button>
      </div>
    </Modal>
  );
};

export default TxnDetailModal;

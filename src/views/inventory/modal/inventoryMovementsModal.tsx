import { Download, X } from "lucide-react";
import type { StockMovement } from "../../../types/inventory";
import { MV_META } from "../../../utils/json/inventoryData";
import { MOVE_ICON } from "../inventoryIcons";
import DialogEyebrow from "@/components/common/DialogEyebrow";

/*
   Stock Movements log — ported from #modal-movements in
   tailwind/src/inventory.html and openMovements()/moveHtml() in
   assets/js/inventory.js.
*/

/** moveHtml() — the shared movement row used by the sidebar and this log. */
export const MovementRow = ({ move }: { move: StockMovement }) => {
  const meta = MV_META[move.type];
  const Icon = MOVE_ICON[move.type];
  const qty =
    move.type === "adj"
      ? move.qty > 0
        ? "+" + move.qty
        : String(move.qty)
      : meta.sign + Math.abs(move.qty);

  return (
    <div className="flex items-center gap-3">
      <div className={`mv-dot ${meta.cls}`}>
        <Icon className={`w-[14px] h-[14px] ${meta.color} shrink-0`} aria-hidden="true" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-medium c-text truncate">{move.item}</div>
        <div className="text-[11px] c-dim">
          {move.ref} · {move.when}
        </div>
      </div>
      <div className={`text-sm font-black ${meta.color}`}>{qty}</div>
    </div>
  );
};

type InventoryMovementsModalProps = {
  open: boolean;
  moves: StockMovement[];
  onClose: () => void;
  onExport: () => void;
};

const InventoryMovementsModal = ({
  open,
  moves,
  onClose,
  onExport,
}: InventoryMovementsModalProps) => (
  <div
    className={open ? "modal-overlay open" : "modal-overlay"}
    onClick={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}
    role="dialog"
    aria-modal="true"
    aria-hidden={!open}
  >
    <div className="modal-box glass modal-w-540">
      <div className="flex items-center justify-between mb-4">
        <div className="min-w-0">
          <DialogEyebrow />
          <h3 className="text-base font-black c-text">Stock Movements</h3>
        </div>
        <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
          <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        </button>
      </div>
      <div className="mv-scroll space-y-3 mb-5">
        {moves.length ? (
          moves.map((move, i) => <MovementRow key={`${move.item}-${i}`} move={move} />)
        ) : (
          <div className="text-xs c-dim text-center py-6">No movements recorded</div>
        )}
      </div>
      <div className="flex gap-3">
        <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
          Close
        </button>
        <button
          type="button"
          className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
          onClick={onExport}
        >
          <Download className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
          Export Log
        </button>
      </div>
    </div>
  </div>
);

export default InventoryMovementsModal;

import { UploadCloud, X } from "lucide-react";

/*
   Import Inventory — ported from #modal-import in tailwind/src/inventory.html
   and the 'confirm-import' action in assets/js/inventory.js.
*/

type InventoryImportModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

const InventoryImportModal = ({ open, onClose, onConfirm }: InventoryImportModalProps) => (
  <div
    className={open ? "modal-overlay open" : "modal-overlay"}
    onClick={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}
    role="dialog"
    aria-modal="true"
    aria-hidden={!open}
  >
    <div className="modal-box glass">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-black c-text">Import Inventory</h3>
        <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
          <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        </button>
      </div>
      <label className="dropzone block mb-4">
        <UploadCloud className="shrink-0" aria-hidden="true" />
        <div className="text-sm font-semibold c-text">Drop a CSV file here or click to browse</div>
        <div className="text-xs mt-1 c-dim">Columns: name, sku, category, price, onHand, reorder</div>
        <input type="file" accept=".csv" className="hidden" />
      </label>
      <div className="flex gap-3">
        <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
          Cancel
        </button>
        <button
          type="button"
          className="btn-gold flex-1 py-2.5 text-sm"
          onClick={() => {
            onConfirm();
            onClose();
          }}
        >
          Import Inventory
        </button>
      </div>
    </div>
  </div>
);

export default InventoryImportModal;

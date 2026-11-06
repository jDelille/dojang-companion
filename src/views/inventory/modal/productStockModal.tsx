import { useState } from "react";
import { X } from "lucide-react";
import type { Product } from "../../../types/products";
import { STOCK_REASONS } from "../../../utils/json/productsData";
import CommonSelect from "../../../components/common-select/commonSelect";
import DialogEyebrow from "@/components/common/DialogEyebrow";

/*
   Stock Update — ported from #modal-stock in tailwind/src/products.html and
   openStock()/confirmStock() in assets/js/products.js. The −/+ steppers adjust
   the quantity, which is clamped at zero.
*/

const REASON_OPTIONS = STOCK_REASONS.map((value) => ({ value, label: value }));

type ProductStockModalProps = {
  product: Product | null;
  onClose: () => void;
  onConfirm: (id: number, qty: number) => void;
};

const ProductStockModal = ({ product, onClose, onConfirm }: ProductStockModalProps) => {
  const open = product !== null;
  const [qty, setQty] = useState(String(product?.stock ?? 0));
  const [reason, setReason] = useState(STOCK_REASONS[0]);

  const step = (delta: number) =>
    setQty((prev) => String(Math.max(0, (Number(prev) || 0) + delta)));

  return (
    <div
      className={open ? "modal-overlay open" : "modal-overlay"}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-hidden={!open}
    >
      <div className="modal-box glass modal-w-380">
        <div className="flex items-center justify-between mb-4">
          <div className="min-w-0">
            <DialogEyebrow />
            <h3 className="text-base font-black c-text">Stock Update</h3>
          </div>
          <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
        <div className="ctx-box mb-4">
          {product ? `${product.name} · ${product.sku}` : "Product"}
        </div>
        <div className="flex items-center justify-between mb-3 text-sm">
          <span className="c-dim">Current stock</span>
          <span className="font-bold c-text">
            <span>{product?.stock ?? 0}</span> units
          </span>
        </div>
        <label className="f-label">New quantity</label>
        <div className="flex items-center gap-2 mb-4">
          <button type="button" className="stock-step" onClick={() => step(-1)}>
            −
          </button>
          <input
            type="number"
            min="0"
            className="fp-input py-2.5 text-sm text-center"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
          />
          <button type="button" className="stock-step" onClick={() => step(1)}>
            +
          </button>
        </div>
        <label className="f-label">Reason</label>
        <CommonSelect
          fieldClassName="py-2.5 text-sm mb-1"
          ariaLabel="Reason"
          options={REASON_OPTIONS}
          value={reason}
          onChange={(option) => setReason(option?.value ?? STOCK_REASONS[0])}
        />
        <div className="flex gap-3 mt-5">
          <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-gold flex-1 py-2.5 text-sm"
            onClick={() => {
              if (!product) return;
              onConfirm(product.id, Number(qty) || 0);
              onClose();
            }}
          >
            Update Stock
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductStockModal;

import { Layers, Pencil, X } from "lucide-react";
import type { Product } from "../../../types/products";
import { moneyWhole } from "../../../utils/formatUtils";
import { PRODUCT_CAT_FALLBACK, PRODUCT_CAT_ICON } from "../productIcons";
import { stockBadgeCls, stockStateOf } from "../useProducts";
import DialogEyebrow from "@/components/common/DialogEyebrow";

/*
   Product Details — ported from #modal-view in tailwind/src/products.html and
   openView() in assets/js/products.js.
*/

type ProductViewModalProps = {
  product: Product | null;
  onClose: () => void;
  onStock: () => void;
  onEdit: () => void;
};

const ProductViewModal = ({ product, onClose, onStock, onEdit }: ProductViewModalProps) => {
  const open = product !== null;
  const Icon = product
    ? PRODUCT_CAT_ICON[product.category] ?? PRODUCT_CAT_FALLBACK
    : PRODUCT_CAT_FALLBACK;

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
      <div className="modal-box glass modal-w-460">
        <div className="flex items-center justify-between mb-4">
          <div className="min-w-0">
            <DialogEyebrow />
            <h3 className="text-base font-black c-text">Product Details</h3>
          </div>
          <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
        <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-card2">
          <div className="prod-ic size-px-44">
            <Icon
              className="shrink-0"
              style={{ width: "24px", height: "24px", color: "#D4AF37" }}
              aria-hidden="true"
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-black c-text truncate">{product?.name ?? "Product"}</div>
            <div className="text-[11px] c-gold font-semibold uppercase tracking-wider">
              {product?.category ?? "Category"}
            </div>
          </div>
          <span className={`badge ${product ? stockBadgeCls(product) : "badge-present"}`}>
            <span className="dot" />
            {product ? stockStateOf(product) : "In Stock"}
          </span>
        </div>
        <div className="mb-5">
          <div className="detail-row">
            <span className="k">SKU</span>
            <span className="v font-mono">{product?.sku ?? "—"}</span>
          </div>
          <div className="detail-row">
            <span className="k">Price</span>
            <span className="v gt">{product ? moneyWhole(product.price) : "—"}</span>
          </div>
          <div className="detail-row">
            <span className="k">Stock on hand</span>
            <span className="v">{product ? product.stock + " units" : "—"}</span>
          </div>
          <div className="detail-row">
            <span className="k">Inventory value</span>
            <span className="v">{product ? moneyWhole(product.price * product.stock) : "—"}</span>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            className="btn-ghost flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
            onClick={onStock}
          >
            <Layers className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            Stock
          </button>
          <button
            type="button"
            className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
            onClick={onEdit}
          >
            <Pencil className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            Edit
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductViewModal;

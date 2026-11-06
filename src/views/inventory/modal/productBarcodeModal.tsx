import { Printer, X } from "lucide-react";
import type { Product } from "../../../types/products";
import { barcodeBars } from "../useProducts";
import DialogEyebrow from "@/components/common/DialogEyebrow";

/*
   Barcode — ported from #modal-barcode in tailwind/src/products.html and
   openBarcode() in assets/js/products.js. The bar pattern is deterministic,
   seeded from `sku + id`, so a product always renders the same code.
*/

type ProductBarcodeModalProps = {
  product: Product | null;
  onClose: () => void;
  onPrint: () => void;
};

const ProductBarcodeModal = ({ product, onClose, onPrint }: ProductBarcodeModalProps) => {
  const open = product !== null;
  const bars = product ? barcodeBars(product.sku + product.id) : [];

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
            <h3 className="text-base font-black c-text">Barcode</h3>
          </div>
          <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
        <div className="text-sm font-semibold c-text text-center mb-3">
          {product?.name ?? "Product"}
        </div>
        <div className="barcode-box mb-4">
          <div className="barcode-bars">
            {bars.map((kind, index) => (
              <i key={index} className={kind} />
            ))}
          </div>
          <div className="barcode-num">{product?.sku ?? "SKU-000"}</div>
        </div>
        <div className="flex gap-3">
          <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
            Close
          </button>
          <button
            type="button"
            className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
            onClick={onPrint}
          >
            <Printer className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            Print
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductBarcodeModal;

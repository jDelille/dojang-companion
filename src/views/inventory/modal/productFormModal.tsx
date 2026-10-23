import { useState } from "react";
import { Check, X } from "lucide-react";
import type { Product, ProductCategory, ProductFormValues } from "../../../types/products";
import { PRODUCT_CATS } from "../../../utils/json/productsData";
import CommonSelect from "../../../components/common-select/commonSelect";

/*
   Add / Edit Product — ported from #modal-product-form in
   tailwind/src/products.html and openForm()/submitForm() in
   assets/js/products.js.
*/

const toOptions = (values: readonly string[]) => values.map((value) => ({ value, label: value }));

type ProductFormModalProps = {
  open: boolean;
  target: Product | null;
  onClose: () => void;
  onSubmit: (values: ProductFormValues, editId: number | null) => boolean;
};

const ProductFormModal = ({ open, target, onClose, onSubmit }: ProductFormModalProps) => {
  const [name, setName] = useState(target?.name ?? "");
  const [category, setCategory] = useState<ProductCategory>(
    target?.category ?? PRODUCT_CATS[0],
  );
  const [sku, setSku] = useState(target?.sku ?? "");
  const [price, setPrice] = useState(target ? String(target.price) : "");
  const [stock, setStock] = useState(target ? String(target.stock) : "");

  const submit = () => {
    const accepted = onSubmit(
      { name, category, sku, price: Number(price) || 0, stock: Number(stock) || 0 },
      target?.id ?? null,
    );
    if (accepted) onClose();
  };

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
      <div className="modal-box glass">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-black c-text">
            {target ? "Edit Product" : "Add New Product"}
          </h3>
          <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <div>
            <label className="f-label">Product name</label>
            <input
              type="text"
              className="fp-input py-2.5 text-sm"
              placeholder="e.g. Whey Protein 2 lb"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="f-label">Category</label>
              <CommonSelect
                fieldClassName="py-2.5 text-sm"
                ariaLabel="Category"
                options={toOptions(PRODUCT_CATS)}
                value={category}
                onChange={(option) =>
                  setCategory((option?.value as ProductCategory) ?? PRODUCT_CATS[0])
                }
              />
            </div>
            <div>
              <label className="f-label">SKU</label>
              <input
                type="text"
                className="fp-input py-2.5 text-sm"
                placeholder="SKU-000"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="f-label">Price ($)</label>
              <input
                type="number"
                min="0"
                className="fp-input py-2.5 text-sm"
                placeholder="0"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
            <div>
              <label className="f-label">Stock qty</label>
              <input
                type="number"
                min="0"
                className="fp-input py-2.5 text-sm"
                placeholder="0"
                required
                value={stock}
                onChange={(e) => setStock(e.target.value)}
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
              {target ? "Save Changes" : "Save Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductFormModal;

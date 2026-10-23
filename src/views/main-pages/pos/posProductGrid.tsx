import { Plus } from "lucide-react";
import { cur, starRow } from "./posUtils";
import { spawnRipple } from "./ripple";
import type { CartItem, Product } from "./types";

/*
   Product tiles, ported from renderProducts() in
   tailwind/src/assets/js/pos.js.

   The whole card is clickable and so is the + button inside it; the button
   stops propagation so a click there does not add twice.
*/

/** Below this, a stocked product is flagged Low. 999 means unlimited. */
const LOW_STOCK = 10;
const UNLIMITED = 999;

type PosProductGridProps = {
  products: Product[];
  cart: CartItem[];
  onAdd: (id: number) => void;
};

const PosProductGrid = ({ products, cart, onAdd }: PosProductGridProps) => {
  if (!products.length) {
    return (
      <div id="pos-products" className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
        <div className="col-span-full text-center py-16 t-dim">
          <div className="empty-emoji">🔍</div>
          <div className="text-sm font-semibold">No products found</div>
        </div>
      </div>
    );
  }

  return (
    <div id="pos-products" className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
      {products.map((p) => {
        const qty = cart.find((c) => c.id === p.id)?.qty ?? 0;
        const unlimited = p.stock === UNLIMITED;
        const low = !unlimited && p.stock <= LOW_STOCK;
        const stockLabel = unlimited ? "∞ In Stock" : p.stock + " in stock";
        const stockClass = unlimited ? "t-green" : low ? "t-red" : "t-muted";

        return (
          <div
            key={p.id}
            className={qty > 0 ? "product-card in-cart" : "product-card"}
            onClick={() => onAdd(p.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onAdd(p.id);
              }
            }}
          >
            <div className="product-thumb">
              <span className="product-emoji">{p.emoji}</span>
              {p.fav && <span className="product-fav">★</span>}
              {qty > 0 && <span className="product-qty">{qty}</span>}
              {low && (
                <span className="product-low badge-expired text-[8px] font-bold px-1.5 py-0.5 rounded-full">
                  Low
                </span>
              )}
            </div>
            <div className="p-2.5">
              <div className="font-semibold c-text text-[12.5px] leading-tight truncate">
                {p.name}
              </div>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-[10px] stars">{starRow(p.rating)}</span>
                <span className="text-[10px] t-dim">{p.rating.toFixed(1)}</span>
              </div>
              <div className={`text-[10px] mt-1 ${stockClass}`}>{stockLabel}</div>
              <div className="flex items-center justify-between mt-2">
                <div className="font-bold text-sm gt">{cur(p.price)}</div>
                <button
                  type="button"
                  className="product-add ripple"
                  aria-label={`Add ${p.name}`}
                  onClick={(e) => {
                    // The card behind this is also an add target.
                    e.stopPropagation();
                    spawnRipple(e);
                    onAdd(p.id);
                  }}
                >
                  <Plus className="ic-14" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PosProductGrid;

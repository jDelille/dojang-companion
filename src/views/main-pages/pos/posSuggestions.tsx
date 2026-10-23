import { useMemo } from "react";
import { Sparkles } from "lucide-react";
import HScroll from "./hScroll";
import { cur, suggestionIds } from "./posUtils";
import { spawnRipple } from "./ripple";
import type { CartItem, Product } from "./types";

/*
   "Frequently bought together" rail, ported from renderSuggestions() in
   tailwind/src/assets/js/pos.js.

   Previously this row was a fixed list that never responded to the cart, so
   the heading was claiming something the UI never did. The ids are now scored
   against whatever is in the cart.
*/

type PosSuggestionsProps = {
  cart: CartItem[];
  products: Product[];
  onAdd: (id: number) => void;
};

const PosSuggestions = ({ cart, products, onAdd }: PosSuggestionsProps) => {
  const { ids, why } = useMemo(() => suggestionIds(cart), [cart]);
  const list = useMemo(
    () => ids.map((id) => products.find((p) => p.id === id)).filter((p): p is Product => !!p),
    [ids, products],
  );

  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold c-text flex items-center gap-2 text-sm">
          <Sparkles className="ic-15 t-gold" aria-hidden="true" />
          Smart Suggestions
        </h3>
        <span className="text-[11px] t-muted">{why}</span>
      </div>
      <HScroll
        label="suggestions"
        className="hscroll-oncard"
        trackClassName="gap-2.5 pb-1"
      >
        {list.length ? (
          list.map((s) => (
            <div key={s.id} className="sugg">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0 thumb-mini">
                {s.emoji}
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-semibold c-text whitespace-nowrap">
                  {s.name}
                </div>
                <div className="text-[10px] gt font-bold">{cur(s.price)}</div>
              </div>
              <button
                type="button"
                className="product-add btn-add-inline ripple ml-1 text-[10px] font-bold"
                onClick={(e) => {
                  spawnRipple(e);
                  onAdd(s.id);
                }}
              >
                + Add
              </button>
            </div>
          ))
        ) : (
          <div className="sugg-empty">
            Everything we’d suggest is already in the cart 🎉
          </div>
        )}
      </HScroll>
    </div>
  );
};

export default PosSuggestions;

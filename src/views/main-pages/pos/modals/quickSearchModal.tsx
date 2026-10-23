import { useEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import PosModal from "../posModal";
import { cur } from "../posUtils";
import type { Product } from "../types";

/*
   Quick Product Search (F2), ported from #modal-quick-search /
   renderQuickSearch() in tailwind/src/pos.html and assets/js/pos.js.

   Matches on name or category and shows the first eight hits, as the template
   did — this is a keyboard-first shortcut, not a browse view.
*/

const MAX_RESULTS = 8;
/* The template used a 60ms timeout to focus after the modal's transition. */
const FOCUS_DELAY = 60;

type QuickSearchModalProps = {
  open: boolean;
  onClose: () => void;
  products: Product[];
  onAdd: (id: number) => void;
};

const QuickSearchModal = ({
  open,
  onClose,
  products,
  onAdd,
}: QuickSearchModalProps) => {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus only; the caller keys this modal so the query resets by remounting.
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => inputRef.current?.focus(), FOCUS_DELAY);
    return () => clearTimeout(t);
  }, [open]);

  const list = useMemo(() => {
    const q = query.toLowerCase();
    const base = q
      ? products.filter(
          (p) =>
            p.name.toLowerCase().includes(q) || p.cat.toLowerCase().includes(q),
        )
      : products;
    return base.slice(0, MAX_RESULTS);
  }, [query, products]);

  return (
    <PosModal
      open={open}
      onClose={onClose}
      title="Quick Product Search"
      boxClassName="modal-sm2"
    >
      <div className="relative mb-3">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 ic-14 t-dim"
          aria-hidden="true"
        />
        <input
          ref={inputRef}
          type="text"
          className="fp-input pl-9 py-2.5 text-sm"
          placeholder="Type a product name or category…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <div className="pick-scroll">
        {list.length ? (
          list.map((p) => (
            <div
              key={p.id}
              className="qsearch-result"
              role="button"
              tabIndex={0}
              onClick={() => {
                onAdd(p.id);
                onClose();
              }}
              onKeyDown={(e) => {
                if (e.key !== "Enter" && e.key !== " ") return;
                e.preventDefault();
                onAdd(p.id);
                onClose();
              }}
            >
              <div className="qsearch-thumb">{p.emoji}</div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold c-text truncate">
                  {p.name}
                </div>
                <div className="text-[11px] t-muted">{p.cat}</div>
              </div>
              <div className="text-sm font-bold gt">{cur(p.price)}</div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 t-dim text-sm">No matches</div>
        )}
      </div>
    </PosModal>
  );
};

export default QuickSearchModal;

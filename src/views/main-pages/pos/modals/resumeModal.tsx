import { Bookmark, Save } from "lucide-react";
import PosModal from "../posModal";
import { money } from "../posUtils";
import { spawnRipple } from "../ripple";
import type { HeldOrder } from "../types";

/*
   Resume Held Order, ported from #modal-resume / renderHeld() in
   tailwind/src/pos.html and assets/js/pos.js.

   Drafts and held bills share this list; a draft carries a note and a
   different icon (.is-draft).
*/

type ResumeModalProps = {
  open: boolean;
  onClose: () => void;
  heldOrders: HeldOrder[];
  onResume: (idx: number) => void;
};

const ResumeModal = ({
  open,
  onClose,
  heldOrders,
  onResume,
}: ResumeModalProps) => (
  <PosModal open={open} onClose={onClose} title="Resume Held Order">
    <div className="pick-scroll">
      {heldOrders.length ? (
        heldOrders.map((h, i) => (
          <div key={h.ref + i} className={h.draft ? "held-row is-draft" : "held-row"}>
            <div className="held-ic">
              {h.draft ? (
                <Save className="ic-16 t-gold" aria-hidden="true" />
              ) : (
                <Bookmark className="ic-16 t-gold" aria-hidden="true" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-bold c-text truncate">{h.ref}</div>
              <div className="text-[11px] t-muted truncate">
                {h.customer} · {h.items.length} items · {money(h.total)} · {h.when}
                {h.note ? " · " + h.note : ""}
              </div>
            </div>
            <button
              type="button"
              className="btn-gold ripple px-3 py-1.5 text-[11px]"
              onClick={(e) => {
                spawnRipple(e);
                onResume(i);
                onClose();
              }}
            >
              Resume
            </button>
          </div>
        ))
      ) : (
        <div className="text-center py-8 t-dim text-sm">
          No held orders to resume
        </div>
      )}
    </div>
  </PosModal>
);

export default ResumeModal;

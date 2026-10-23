import {
  CirclePause,
  OctagonX,
  Trash2,
  TriangleAlert,
  Undo2,
  type LucideIcon,
} from "lucide-react";
import PosModal from "../posModal";
import type { ConfirmOptions } from "../types";

/*
   Generic confirmation dialog, ported from confirm() / #modal-confirm in
   tailwind/src/assets/js/pos.js.

   Serves Remove Item, Clear Cart, Cancel Order, Suspend Sale and Refund. The
   template swapped the icon by writing innerHTML; here the caller names an
   icon and this maps it to a component.
*/

const ICONS: Record<string, LucideIcon> = {
  "trash-2": Trash2,
  "x-octagon": OctagonX,
  "pause-circle": CirclePause,
  "undo-2": Undo2,
  "alert-triangle": TriangleAlert,
};

type ConfirmModalProps = {
  opts: ConfirmOptions | null;
  onConfirm: () => void;
  onClose: () => void;
};

const ConfirmModal = ({ opts, onConfirm, onClose }: ConfirmModalProps) => {
  const Icon = (opts?.icon && ICONS[opts.icon]) || TriangleAlert;
  const danger = !!opts?.danger;

  return (
    <PosModal
      open={!!opts}
      onClose={onClose}
      boxClassName="text-center"
      chromeless
    >
      <div className={`confirm-ic ${danger ? "danger" : opts?.tone || "info"}`}>
        <Icon className={`ic-26 ${danger ? "t-red" : "t-gold"}`} aria-hidden="true" />
      </div>
      <h3 className="text-lg font-black c-text mb-1">{opts?.title}</h3>
      <p className="text-sm mb-5 t-muted">{opts?.msg}</p>
      <div className="flex gap-2">
        <button
          type="button"
          className="btn-ghost ripple flex-1 py-2.5 text-sm"
          onClick={onClose}
        >
          Cancel
        </button>
        <button
          type="button"
          className={`btn-${danger ? "danger" : "gold"} ripple flex-1 py-2.5 text-sm`}
          onClick={onConfirm}
        >
          {opts?.confirmText || "Confirm"}
        </button>
      </div>
    </PosModal>
  );
};

export default ConfirmModal;

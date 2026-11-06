import { useEffect, useId, type ReactNode } from "react";
import { X } from "lucide-react";
import DialogEyebrow from "@/components/common/DialogEyebrow";

/*
   Dialog shell for the register.

   POS-local rather than the shared components/common/Modal: that one fixes a
   title + close row and an optional footer, which does not fit the receipt,
   the invoice, the wide refund grid or the centred confirm dialogs. Here the
   whole head is a slot.

   .modal-overlay / .modal-box in style.css already own the fade and the
   scale-in, so `open` only toggles a class — matching openModal()/closeModal()
   in tailwind/src/assets/js/pos.js.
*/

type PosModalProps = {
  open: boolean;
  onClose: () => void;
  /** Rendered inside .modal-head opposite the close button. */
  title?: ReactNode;
  /** Replaces the whole head, including the close button. */
  head?: ReactNode;
  children: ReactNode;
  /** Extra classes for the box, e.g. "glass modal-wide". */
  boxClassName?: string;
  /** Set for the centred dialogs that carry no head at all. */
  chromeless?: boolean;
  /** Stacks above an already-open modal (the invoice over order history). */
  elevated?: boolean;
};

const PosModal = ({
  open,
  onClose,
  title,
  head,
  children,
  boxClassName = "",
  chromeless = false,
  elevated = false,
}: PosModalProps) => {
  const titleId = useId();

  /*
     Esc is handled per-modal rather than globally so the topmost dialog wins:
     the invoice sits over order history and must close alone.
  */
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.stopPropagation();
      onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  return (
    <div
      className={
        "modal-overlay" + (open ? " open" : "") + (elevated ? " z-1050" : "")
      }
      // Clicks inside the box bubble up here, so only close on the overlay
      // itself — the same guard the template used.
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? titleId : undefined}
      aria-hidden={!open}
    >
      <div className={`modal-box ${boxClassName}`.trim()}>
        {head ??
          (chromeless ? null : (
            <div className="modal-head">
              <DialogEyebrow />
              <h3 id={titleId} className="modal-title">
                {title}
              </h3>
              <button
                type="button"
                className="modal-x"
                onClick={onClose}
                aria-label="Close"
              >
                <X className="ic-15" aria-hidden="true" />
              </button>
            </div>
          ))}
        {children}
      </div>
    </div>
  );
};

export default PosModal;

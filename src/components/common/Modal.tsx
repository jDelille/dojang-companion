import { useEffect, useId, type ReactNode } from "react";
import { X } from "lucide-react";
import DialogEyebrow from "@/components/common/DialogEyebrow";

// Looks: style/css/dialogs.css (.modal-box)
type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  // The small label above the title; defaults to the site section
  eyebrow?: string;
  children: ReactNode;
  boxClassName?: string;
  closeClassName?: string;
  footer?: ReactNode;
  titleClassName?: string;
  headerClassName?: string;
};

const Modal = ({
  open,
  onClose,
  title,
  eyebrow,
  children,
  boxClassName = "glass",
  closeClassName = "hbtn",
  footer,
  titleClassName = "text-lg",
  headerClassName = "mb-5",
}: ModalProps) => {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    // Matches document.body.style.overflow in the template's closeAllModals().
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  return (
    <div
      className={open ? "modal-overlay open" : "modal-overlay"}
      // Clicks inside the box bubble up here, so only close when the overlay
      // itself was hit.
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-hidden={!open}
    >
      <div className={`modal-box ${boxClassName}`}>
        <div className={`flex items-center justify-between ${headerClassName}`}>
          <div className="min-w-0">
            <DialogEyebrow label={eyebrow} />
            <h3 id={titleId} className={`font-black c-text ${titleClassName}`}>
              {title}
            </h3>
          </div>
          <button type="button" className={closeClassName} onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px]" aria-hidden="true" />
          </button>
        </div>
        {children}
        {footer && <div className="flex gap-3 mt-5">{footer}</div>}
      </div>
    </div>
  );
};

export default Modal;

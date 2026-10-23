import { useEffect, type ReactNode } from "react";

/*
   Shared confirm dialog for the Referrals page — covers #modal-approve,
   #modal-reject and #modal-delete in tailwind/src/referrals.html, which are
   the same centred layout with a different icon, wording and button.
*/

type ReferralConfirmModalProps = {
  open: boolean;
  onClose: () => void;
  /** Icon medallion; each variant carries its own tint classes. */
  icon: ReactNode;
  iconClassName: string;
  title: string;
  body: ReactNode;
  confirmLabel: string;
  /** `btn-gold` for approve, `btn-danger` for reject and delete. */
  confirmClassName: string;
  onConfirm: () => void;
};

const ReferralConfirmModal = ({
  open,
  onClose,
  icon,
  iconClassName,
  title,
  body,
  confirmLabel,
  confirmClassName,
  onConfirm,
}: ReferralConfirmModalProps) => {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
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
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-hidden={!open}
    >
      <div className="modal-box glass modal-w-380">
        <div className={iconClassName}>{icon}</div>
        <h3 className="text-base font-black c-text text-center mb-1">{title}</h3>
        <p className="text-sm text-center mb-5 c-dim">{body}</p>
        <div className="flex gap-3">
          <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className={`${confirmClassName} flex-1 py-2.5 text-sm`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReferralConfirmModal;

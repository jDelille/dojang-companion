'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';

/*
   The Member 360 window (msg.png): small label, big title, one-line subtitle,
   a divider, the body, and the buttons bottom-left. Built on the browser's
   <dialog>, which already handles Escape, focus trapping and the backdrop.
*/

type Props = {
  eyebrow: string;
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
  actions?: ReactNode;
};

export default function MemberDialog({ eyebrow, title, description, onClose, children, actions }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Open as a modal on mount, close when unmounted
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    dialog.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
      if (dialog.open) dialog.close();
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      className="app-dialog"
      aria-label={title}
      // Escape key
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      // A click on the dim area around the window (the <dialog> itself) closes it
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
    >
      <div className="app-dialog-panel">
        <header className="app-dialog-header">
          <div className="min-w-0">
            <p className="app-dialog-eyebrow">{eyebrow}</p>
            <h2 className="app-dialog-title">{title}</h2>
            {description && <p className="app-dialog-description">{description}</p>}
          </div>
          <button type="button" className="app-dialog-close" aria-label="Close" onClick={onClose}>
            <X size={16} aria-hidden="true" />
          </button>
        </header>
        <div className="app-dialog-body">{children}</div>
        {actions && <footer className="app-dialog-actions">{actions}</footer>}
      </div>
    </dialog>
  );
}

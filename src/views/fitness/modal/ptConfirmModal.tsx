import { Ban, CircleCheck, Trash2 } from "lucide-react";
import type { ReactNode } from "react";
import type { PtSession } from "../../../types/ptSessions";
import DialogEyebrow from "@/components/common/DialogEyebrow";

/*
   Complete / Cancel / Delete confirms — ported from #modal-complete,
   #modal-cancel and #modal-delete in tailwind/src/pt-sessions.html.

   The three overlays are identical apart from the icon, wording and button
   styling, so one component covers all of them via `kind`.
*/

type ConfirmKind = "complete" | "cancel" | "delete";

const CONFIG: Record<
  ConfirmKind,
  {
    icClass: string;
    Icon: typeof CircleCheck;
    iconClass: string;
    title: string;
    cancelLabel: string;
    confirmLabel: string;
    confirmClass: string;
    body: (name: ReactNode) => ReactNode;
  }
> = {
  complete: {
    icClass: "confirm-ic ok",
    Icon: CircleCheck,
    iconClass: "w-6 h-6 c-green shrink-0",
    title: "Complete Session?",
    cancelLabel: "Cancel",
    confirmLabel: "Mark Completed",
    confirmClass: "btn-gold",
    body: (name) => <>Mark {name}&apos;s session as completed?</>,
  },
  cancel: {
    icClass: "confirm-ic warn",
    Icon: Ban,
    iconClass: "w-6 h-6 c-orange shrink-0",
    title: "Cancel Session?",
    cancelLabel: "Keep",
    confirmLabel: "Cancel Session",
    confirmClass: "btn-danger",
    body: (name) => <>Cancel {name}&apos;s session? The slot will be freed up.</>,
  },
  delete: {
    icClass: "confirm-ic danger",
    Icon: Trash2,
    iconClass: "w-6 h-6 c-red shrink-0",
    title: "Delete Session?",
    cancelLabel: "Cancel",
    confirmLabel: "Delete",
    confirmClass: "btn-danger",
    body: (name) => <>Permanently remove {name}&apos;s session? This cannot be undone.</>,
  },
};

type PtConfirmModalProps = {
  kind: ConfirmKind;
  target: PtSession | null;
  onClose: () => void;
  onConfirm: (id: number) => void;
};

const PtConfirmModal = ({ kind, target, onClose, onConfirm }: PtConfirmModalProps) => {
  const open = target !== null;
  const config = CONFIG[kind];
  const { Icon } = config;

  const name = (
    <span className="font-semibold c-text">{target?.member ?? "this member"}</span>
  );

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
        <div className={config.icClass}>
          <Icon className={config.iconClass} aria-hidden="true" />
        </div>
        <DialogEyebrow />
        <h3 className="text-base font-black c-text text-center mb-1">{config.title}</h3>
        <p className="text-sm text-center mb-5 c-dim">{config.body(name)}</p>
        <div className="flex gap-3">
          <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
            {config.cancelLabel}
          </button>
          <button
            type="button"
            className={`${config.confirmClass} flex-1 py-2.5 text-sm`}
            onClick={() => {
              if (!target) return;
              onConfirm(target.id);
              onClose();
            }}
          >
            {config.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PtConfirmModal;

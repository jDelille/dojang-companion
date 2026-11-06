import { Copy, KeyRound } from "lucide-react";
import DialogEyebrow from "@/components/common/DialogEyebrow";

/*
   API Key Reveal — ported from #modal-key-view in tailwind/src/settings.html and
   submitKey()/copyKey() in assets/js/settings.js. Shown once after a key is
   created; the secret is only displayed here.
*/

type SettingsKeyViewModalProps = {
  open: boolean;
  code: string;
  meta: string;
  onClose: () => void;
  onCopy: () => void;
};

const SettingsKeyViewModal = ({ open, code, meta, onClose, onCopy }: SettingsKeyViewModalProps) => (
  <div
    className={open ? "modal-overlay open" : "modal-overlay"}
    onClick={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}
    role="dialog"
    aria-modal="true"
    aria-hidden={!open}
  >
    <div className="modal-box glass modal-w-460">
      <div className="confirm-ic gold">
        <KeyRound className="w-6 h-6 c-gold shrink-0" aria-hidden="true" />
      </div>
      <DialogEyebrow />
      <h3 className="text-base font-black c-text text-center mb-1">Your New API Key</h3>
      <p className="text-sm text-center mb-4 c-dim">
        Copy it now — for security it is only shown once.
      </p>
      <div className="key-code mb-3">{code}</div>
      <div className="ctx-box mb-5">{meta}</div>
      <div className="flex gap-3">
        <button
          type="button"
          className="btn-ghost flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
          onClick={onCopy}
        >
          <Copy className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
          Copy
        </button>
        <button type="button" className="btn-gold flex-1 py-2.5 text-sm" onClick={onClose}>
          Done
        </button>
      </div>
    </div>
  </div>
);

export default SettingsKeyViewModal;

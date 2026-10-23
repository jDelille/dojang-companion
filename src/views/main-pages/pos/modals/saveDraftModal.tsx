import { useState } from "react";
import { Save } from "lucide-react";
import PosModal from "../posModal";

/*
   Save Draft, ported from #modal-save-draft / saveDraft() in
   tailwind/src/pos.html and assets/js/pos.js.

   An empty name is allowed — saveDraft() falls back to "<customer> — N items".
*/

type SaveDraftModalProps = {
  open: boolean;
  onClose: () => void;
  /** Returns false when there is nothing to save, leaving the modal up. */
  onSave: (name: string, note: string) => boolean;
};

const SaveDraftModal = ({ open, onClose, onSave }: SaveDraftModalProps) => {
  const [name, setName] = useState("");
  const [note, setNote] = useState("");

  return (
    <PosModal open={open} onClose={onClose} title="Save Draft">
      <div className="field">
        <label className="field-label">Draft Name</label>
        <input
          type="text"
          className="fp-input py-2.5 text-sm"
          placeholder="e.g. Ashley — supplements"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="field">
        <label className="field-label">Note (optional)</label>
        <textarea
          className="fp-input fp-textarea py-2.5 text-sm"
          placeholder="Anything to remember…"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>
      <div className="modal-actions">
        <button
          type="button"
          className="btn-ghost ripple flex-1 py-2.5 text-sm"
          onClick={onClose}
        >
          Cancel
        </button>
        <button
          type="button"
          className="btn-gold ripple flex-1 py-2.5 text-sm flex items-center justify-center gap-1"
          onClick={() => {
            if (onSave(name, note)) onClose();
          }}
        >
          <Save className="ic-14" aria-hidden="true" />
          Save Draft
        </button>
      </div>
    </PosModal>
  );
};

export default SaveDraftModal;

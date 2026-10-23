import { useEffect } from "react";
import { Trash2 } from "lucide-react";
import type { Challenge } from "../../../types/challenges";

/*
   Delete Challenge — ported from #modal-delete in
   tailwind/src/challenges.html and openDelete()/confirmDelete() in
   assets/js/challenges.js.
*/

type DeleteChallengeModalProps = {
  challenge: Challenge | null;
  onClose: () => void;
  onConfirm: (challenge: Challenge) => void;
};

const DeleteChallengeModal = ({
  challenge,
  onClose,
  onConfirm,
}: DeleteChallengeModalProps) => {
  const open = challenge !== null;

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
        <div className="danger-ic">
          <Trash2 className="w-6 h-6 c-red shrink-0" aria-hidden="true" />
        </div>
        <h3 className="text-base font-black c-text text-center mb-1">Delete Challenge?</h3>
        <p className="text-sm text-center mb-5 c-dim">
          Delete{" "}
          <span className="font-semibold c-text">{challenge?.name ?? "this challenge"}</span>{" "}
          and its leaderboard? This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-danger flex-1 py-2.5 text-sm"
            onClick={() => challenge && onConfirm(challenge)}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteChallengeModal;

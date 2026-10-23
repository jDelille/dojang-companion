import { useEffect, useState } from "react";
import { Check, TrendingUp, X } from "lucide-react";
import CommonSelect from "../../../components/common-select/commonSelect";
import type { Challenge } from "../../../types/challenges";

/*
   Update Progress — ported from #modal-progress in
   tailwind/src/challenges.html and openProgress()/syncProgressInputs()/
   confirmProgress() in assets/js/challenges.js.

   Switching participant reloads that member's points and progress, which the
   template did through a change listener on #pg-member.
*/

type UpdateProgressModalProps = {
  challenge: Challenge | null;
  onClose: () => void;
  onUpdate: (
    challenge: Challenge,
    index: number,
    points: number,
    progress: number,
  ) => void;
};

const UpdateProgressModal = ({
  challenge,
  onClose,
  onUpdate,
}: UpdateProgressModalProps) => {
  const open = challenge !== null;
  const [index, setIndex] = useState(0);
  const [points, setPoints] = useState(String(challenge?.board[0]?.points ?? 0));
  const [progress, setProgress] = useState(String(challenge?.board[0]?.progress ?? 0));

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

  /* Selecting a different participant reloads their current figures. */
  const selectParticipant = (next: number) => {
    setIndex(next);
    const participant = challenge?.board[next];
    setPoints(String(participant?.points ?? 0));
    setProgress(String(participant?.progress ?? 0));
  };

  const memberOptions =
    challenge?.board.map((participant, i) => ({
      value: String(i),
      label: participant.name,
    })) ?? [];

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
      <div className="modal-box glass modal-w-420">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="icon-box ic-gold ic-38">
              <TrendingUp className="w-[17px] h-[17px] c-gold shrink-0" aria-hidden="true" />
            </div>
            <h3 className="text-base font-black c-text">Update Progress</h3>
          </div>
          <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="f-label">Participant</label>
            <CommonSelect
              fieldClassName="py-2.5 text-sm"
              ariaLabel="Participant"
              options={memberOptions}
              value={String(index)}
              onChange={(option) => selectParticipant(Number(option?.value ?? 0))}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="f-label">Points</label>
              <input
                type="number"
                className="fp-input py-2.5 text-sm"
                value={points}
                onChange={(e) => setPoints(e.target.value)}
              />
            </div>
            <div>
              <label className="f-label">Progress %</label>
              <input
                type="number"
                className="fp-input py-2.5 text-sm"
                value={progress}
                onChange={(e) => setProgress(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
            onClick={() =>
              challenge &&
              onUpdate(challenge, index, Number(points) || 0, Number(progress) || 0)
            }
          >
            <Check className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            Update
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateProgressModal;

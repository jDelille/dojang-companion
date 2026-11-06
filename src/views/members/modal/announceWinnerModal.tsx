import { useEffect, useState } from "react";
import { Crown, Megaphone, X } from "lucide-react";
import type { Challenge, Participant } from "../../../types/challenges";
import { avatarFor, initials, number } from "../../../utils/formatUtils";
import DialogEyebrow from "@/components/common/DialogEyebrow";

/*
   Announce Winner — ported from #modal-winner in
   tailwind/src/challenges.html and openWinner()/confirmWinner() in
   assets/js/challenges.js.

   The "mark completed" box starts checked unless the challenge already
   finished, matching openWinner()'s default.
*/

const MEDALS = ["🥇", "🥈", "🥉"];

type AnnounceWinnerModalProps = {
  challenge: Challenge | null;
  /** Board already sorted by the active metric. */
  board: Participant[];
  onClose: () => void;
  onAnnounce: (challenge: Challenge, complete: boolean, winner?: Participant) => void;
};

const AnnounceWinnerModal = ({
  challenge,
  board,
  onClose,
  onAnnounce,
}: AnnounceWinnerModalProps) => {
  const open = challenge !== null;
  const [complete, setComplete] = useState(challenge?.status !== "Completed");

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
      <div className="modal-box glass modal-w-420">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="icon-box grad-gold ic-38">
              <Crown className="w-[17px] h-[17px] t-ink shrink-0" aria-hidden="true" />
            </div>
            <DialogEyebrow />
            <h3 className="text-base font-black c-text">Announce Winner</h3>
          </div>
          <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
        <div className="text-[12px] c-dim mb-3">
          Top performers for{" "}
          <span className="c-gold font-bold">{challenge?.name ?? "—"}</span>
        </div>
        <div className="flex flex-col gap-2 mb-4">
          {board.slice(0, 3).map((participant, index) => (
            <div key={participant.name} className="win-row">
              <div className="pod-medal">{MEDALS[index]}</div>
              <div className={`lb-av av ${avatarFor(participant.name)}`}>
                {initials(participant.name)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-bold c-text truncate">
                  {participant.name}
                </div>
                <div className="text-[11px] c-dim">
                  {number(participant.points)} pts · {participant.progress}%
                </div>
              </div>
            </div>
          ))}
        </div>
        <label className="flex items-center gap-2 text-xs c-dim cursor-pointer">
          <input
            type="checkbox"
            className="w-4 h-4 accent-[#D4AF37]"
            checked={complete}
            onChange={(e) => setComplete(e.target.checked)}
          />
          Mark challenge as completed
        </label>
        <div className="flex gap-3 mt-5">
          <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
            onClick={() => challenge && onAnnounce(challenge, complete, board[0])}
          >
            <Megaphone className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            Announce &amp; Reward
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnnounceWinnerModal;

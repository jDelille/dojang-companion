import { useEffect, useState } from "react";
import { CheckCircle, UserPlus, X } from "lucide-react";
import CommonSelect from "../../../components/common-select/commonSelect";
import type { Challenge } from "../../../types/challenges";
import { JOIN_MEMBERS } from "../../../utils/json/challengesData";
import DialogEyebrow from "@/components/common/DialogEyebrow";

/*
   Join Challenge — ported from #modal-join in tailwind/src/challenges.html
   and openJoin()/confirmJoin() in assets/js/challenges.js.
*/

const MEMBER_OPTIONS = JOIN_MEMBERS.map((value) => ({ value, label: value }));

type JoinChallengeModalProps = {
  challenge: Challenge | null;
  onClose: () => void;
  onJoin: (
    challenge: Challenge,
    name: string,
    points: number,
    progress: number,
  ) => void;
};

const JoinChallengeModal = ({ challenge, onClose, onJoin }: JoinChallengeModalProps) => {
  const open = challenge !== null;
  const [member, setMember] = useState(JOIN_MEMBERS[0]);
  const [points, setPoints] = useState("0");
  const [progress, setProgress] = useState("0");

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
              <UserPlus className="w-[17px] h-[17px] t-ink shrink-0" aria-hidden="true" />
            </div>
            <DialogEyebrow />
            <h3 className="text-base font-black c-text">Join Challenge</h3>
          </div>
          <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
        <div className="p-3 rounded-xl mb-4 text-[13px] c-gold gold-border-card">
          {challenge ? `${challenge.name} · ${challenge.days}` : "—"}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="f-label">Member</label>
            <CommonSelect
              fieldClassName="py-2.5 text-sm"
              ariaLabel="Member"
              options={MEMBER_OPTIONS}
              value={member}
              onChange={(option) => setMember(option?.value ?? JOIN_MEMBERS[0])}
            />
          </div>
          <div>
            <label className="f-label">Start Points</label>
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
        <div className="flex gap-3 mt-5">
          <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
            onClick={() =>
              challenge &&
              onJoin(challenge, member, Number(points) || 0, Number(progress) || 0)
            }
          >
            <CheckCircle className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            Enroll
          </button>
        </div>
      </div>
    </div>
  );
};

export default JoinChallengeModal;

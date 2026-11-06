import { useEffect, useState } from "react";
import { Trophy, X } from "lucide-react";
import CommonSelect from "../../../components/common-select/commonSelect";
import type {
  Challenge,
  ChallengeStatus,
  ChallengeTheme,
} from "../../../types/challenges";
import {
  CHALLENGE_STATUS_OPTIONS,
  THEME_OPTIONS,
} from "../../../utils/json/challengesData";
import type { ChallengeFormInput } from "../useChallenges";
import DialogEyebrow from "@/components/common/DialogEyebrow";

/*
   New / Edit Challenge — ported from #modal-edit in
   tailwind/src/challenges.html and openAdd()/openEdit()/saveEdit() in
   assets/js/challenges.js.
*/

const toOptions = (values: readonly string[]) =>
  values.map((value) => ({ value, label: value }));

type ChallengeFormModalProps = {
  open: boolean;
  /** The challenge being edited, or null when creating. */
  challenge: Challenge | null;
  onClose: () => void;
  onSave: (input: ChallengeFormInput) => void;
  /** Called instead of onSave when the name is blank. */
  onInvalid: () => void;
};

const ChallengeFormModal = ({
  open,
  challenge,
  onClose,
  onSave,
  onInvalid,
}: ChallengeFormModalProps) => {
  const [name, setName] = useState(challenge?.name ?? "");
  const [theme, setTheme] = useState<ChallengeTheme>(challenge?.theme ?? "steps");
  const [status, setStatus] = useState<ChallengeStatus>(challenge?.status ?? "Active");
  const [days, setDays] = useState(challenge?.days ?? "");
  const [participants, setParticipants] = useState(
    challenge ? String(challenge.participants) : "",
  );
  const [reward, setReward] = useState(challenge?.reward ?? "");

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

  const save = () => {
    const trimmed = name.trim();
    // saveEdit() toasted "Enter a challenge name" and kept the modal open.
    if (!trimmed) {
      onInvalid();
      return;
    }
    onSave({
      id: challenge?.id ?? null,
      name: trimmed,
      theme,
      status,
      days,
      participants: Number(participants) || 0,
      reward,
    });
    onClose();
  };

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
      <div className="modal-box glass modal-w-520">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="icon-box grad-gold ic-38">
              <Trophy className="w-[17px] h-[17px] t-ink shrink-0" aria-hidden="true" />
            </div>
            <DialogEyebrow />
            <h3 className="text-base font-black c-text">
              {challenge ? "Edit Challenge" : "New Challenge"}
            </h3>
          </div>
          <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="f-label">Challenge Name</label>
            <input
              type="text"
              className="fp-input py-2.5 text-sm"
              placeholder="e.g. 10K Steps Streak"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="f-label">Type</label>
            <CommonSelect
              fieldClassName="py-2.5 text-sm"
              ariaLabel="Type"
              options={THEME_OPTIONS}
              value={theme}
              onChange={(option) => setTheme((option?.value as ChallengeTheme) ?? "steps")}
            />
          </div>
          <div>
            <label className="f-label">Status</label>
            <CommonSelect
              fieldClassName="py-2.5 text-sm"
              ariaLabel="Status"
              options={toOptions(CHALLENGE_STATUS_OPTIONS)}
              value={status}
              onChange={(option) =>
                setStatus((option?.value as ChallengeStatus) ?? "Active")
              }
            />
          </div>
          <div>
            <label className="f-label">Duration</label>
            <input
              type="text"
              className="fp-input py-2.5 text-sm"
              placeholder="e.g. Ends in 6 days"
              value={days}
              onChange={(e) => setDays(e.target.value)}
            />
          </div>
          <div>
            <label className="f-label">Participants</label>
            <input
              type="number"
              className="fp-input py-2.5 text-sm"
              placeholder="0"
              value={participants}
              onChange={(e) => setParticipants(e.target.value)}
            />
          </div>
          <div className="col-span-2">
            <label className="f-label">Reward</label>
            <input
              type="text"
              className="fp-input py-2.5 text-sm"
              placeholder="e.g. 3 months free + merch"
              value={reward}
              onChange={(e) => setReward(e.target.value)}
            />
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn-gold flex-1 py-2.5 text-sm" onClick={save}>
            Save Challenge
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChallengeFormModal;

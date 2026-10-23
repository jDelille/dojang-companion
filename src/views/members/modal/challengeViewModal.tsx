import { Crown, UserPlus } from "lucide-react";
import Modal from "../../../components/common/Modal";
import type { Challenge, Participant } from "../../../types/challenges";
import {
  CHALLENGE_STATUS_BADGE,
  CHALLENGE_THEME,
  THEME_LABEL,
} from "../../../utils/json/challengesData";
import { avatarFor, initials, number } from "../../../utils/formatUtils";
import CHALLENGE_THEME_ICON from "../challengeThemeIcon";

/*
   Challenge Details — ported from #modal-view in tailwind/src/challenges.html
   and openView() in assets/js/challenges.js.
*/

type ChallengeViewModalProps = {
  challenge: Challenge | null;
  /** Board already sorted by the active metric. */
  board: Participant[];
  onClose: () => void;
  onJoin: (challenge: Challenge) => void;
  onWinner: (challenge: Challenge) => void;
};

const ChallengeViewModal = ({
  challenge,
  board,
  onClose,
  onJoin,
  onWinner,
}: ChallengeViewModalProps) => {
  const theme = challenge ? CHALLENGE_THEME[challenge.theme] : CHALLENGE_THEME.steps;
  const Icon = challenge
    ? CHALLENGE_THEME_ICON[challenge.theme]
    : CHALLENGE_THEME_ICON.steps;

  return (
    <Modal
      open={challenge !== null}
      onClose={onClose}
      title="Challenge Details"
      boxClassName="glass modal-w-460"
      titleClassName="text-base"
      headerClassName="mb-4"
    >
      <div className={`ch-hero rounded-2xl mb-4 ${theme.hero}`}>
        <span
          className={`badge ${challenge ? CHALLENGE_STATUS_BADGE[challenge.status] : "badge-present"} ch-badge`}
        >
          <span className="dot" />
          {challenge?.status ?? "Active"}
        </span>
        <Icon className="w-8 h-8 hero-ink shrink-0" aria-hidden="true" />
      </div>
      <div className="text-lg font-black c-text">{challenge?.name ?? "—"}</div>
      <div className="text-[12px] c-dim mb-3">
        {challenge ? `${THEME_LABEL[challenge.theme]} · ${challenge.days}` : "—"}
      </div>
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="win-row block! text-center">
          <div className="text-lg font-black c-text">{challenge?.participants ?? 0}</div>
          <div className="text-[10px] c-dim2">Participants</div>
        </div>
        <div className="win-row block! text-center">
          <div className="text-lg font-black gt">{challenge?.completion ?? 0}%</div>
          <div className="text-[10px] c-dim2">Avg Completion</div>
        </div>
        <div className="win-row block! text-center">
          <div className="text-sm font-black c-text truncate">
            {/* Leader shows the first name only, as in the template. */}
            {board.length ? board[0].name.split(" ")[0] : "—"}
          </div>
          <div className="text-[10px] c-dim2">Leader</div>
        </div>
      </div>
      <div className="f-label">Top Participants</div>
      <div className="flex flex-col gap-2">
        {board.length ? (
          board.slice(0, 5).map((participant, index) => (
            <div key={participant.name} className="win-row">
              <div className="lb-rank c-dim2">{index + 1}</div>
              <div className={`lb-av av ${avatarFor(participant.name)}`}>
                {initials(participant.name)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-bold c-text truncate">
                  {participant.name}
                </div>
              </div>
              <div className="text-[13px] font-black c-gold">
                {number(participant.points)}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-4 text-xs c-dim">No participants yet</div>
        )}
      </div>
      <div className="flex gap-2 mt-4">
        <button
          type="button"
          className="btn-ghost flex-1 py-2.5 text-sm flex items-center justify-center gap-1.5"
          onClick={() => challenge && onJoin(challenge)}
        >
          <UserPlus className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
          Join
        </button>
        <button
          type="button"
          className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-1.5"
          onClick={() => challenge && onWinner(challenge)}
        >
          <Crown className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
          Announce Winner
        </button>
      </div>
    </Modal>
  );
};

export default ChallengeViewModal;

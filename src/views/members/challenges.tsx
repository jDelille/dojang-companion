import { useState } from "react";
import {
  Award,
  Check,
  CheckCircle2,
  Clock,
  Crown,
  Download,
  Edit2,
  Eye,
  Flame,
  Gift,
  Info,
  MoreVertical,
  Radio,
  Share2,
  Star,
  TrendingUp,
  Trash2,
  Trophy,
  UserPlus,
  Users,
} from "lucide-react";
import RowMenu from "../../components/common/rowMenu";
import Toast from "../../components/common/Toast";
import CommonSelect from "../../components/common-select/commonSelect";
import useToast from "../../hooks/useToast";
import type { Challenge, ChallengeStatus, LeaderboardMetric } from "../../types/challenges";
import {
  CHALLENGE_STATUS_BADGE,
  CHALLENGE_THEME,
} from "../../utils/json/challengesData";
import { avatarFor, initials, number } from "../../utils/formatUtils";
import CHALLENGE_THEME_ICON from "./challengeThemeIcon";
import useChallenges, { CHALLENGE_TABS } from "./useChallenges";
import ChallengeFormModal from "./modal/challengeFormModal";
import ChallengeViewModal from "./modal/challengeViewModal";
import JoinChallengeModal from "./modal/joinChallengeModal";
import UpdateProgressModal from "./modal/updateProgressModal";
import AnnounceWinnerModal from "./modal/announceWinnerModal";
import DeleteChallengeModal from "./modal/deleteChallengeModal";
import ChallengeExportModal from "./modal/challengeExportModal";

/*
   Challenges & Leaderboard — ported from tailwind/src/challenges.html +
   assets/js/challenges.js.

   The podium renders in 2 · 1 · 3 order so the winner stands in the middle,
   which the template achieved by reordering the top three before mapping.
*/

const METRIC_OPTIONS = [
  { value: "points", label: "By Points" },
  { value: "progress", label: "By Progress" },
];

const TAB_ICON: Record<ChallengeStatus, typeof Radio> = {
  Active: Radio,
  Upcoming: Clock,
  Completed: CheckCircle2,
};

const MEDAL_EMOJI: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };
const MEDAL_CLASS: Record<number, string> = {
  1: "medal-gold",
  2: "medal-silver",
  3: "medal-bronze",
};

const Challenges = () => {
  const {
    visible,
    selected,
    board,
    sortedBoard,
    kpis,
    tab,
    setTab,
    metric,
    setMetric,
    activeId,
    setActiveId,
    saveChallenge,
    joinChallenge,
    updateProgress,
    announceWinner,
    removeChallenge,
  } = useChallenges();
  const { message, visible: toastVisible, showToast } = useToast();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Challenge | null>(null);
  const [view, setView] = useState<Challenge | null>(null);
  const [joinTarget, setJoinTarget] = useState<Challenge | null>(null);
  const [progressTarget, setProgressTarget] = useState<Challenge | null>(null);
  const [winnerTarget, setWinnerTarget] = useState<Challenge | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Challenge | null>(null);
  const [exportOpen, setExportOpen] = useState(false);

  const openForm = (challenge: Challenge | null) => {
    setEditing(challenge);
    setFormOpen(true);
  };

  /* These two bail out when there is nobody on the board, as the template did. */
  const openProgress = (challenge: Challenge) => {
    if (!challenge.board.length) {
      showToast("No participants to update yet");
      return;
    }
    setProgressTarget(challenge);
  };
  const openWinner = (challenge: Challenge) => {
    if (!challenge.board.length) {
      showToast("No participants to rank yet");
      return;
    }
    setWinnerTarget(challenge);
  };

  const menuItemsFor = (challenge: Challenge) => (
    <>
      <button type="button" className="dropdown-item" onClick={() => setView(challenge)}>
        <Eye className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        View
      </button>
      <button type="button" className="dropdown-item" onClick={() => openForm(challenge)}>
        <Edit2 className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        Edit
      </button>
      <button
        type="button"
        className="dropdown-item"
        onClick={() => setJoinTarget(challenge)}
      >
        <UserPlus className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        Join Challenge
      </button>
      <button type="button" className="dropdown-item" onClick={() => openProgress(challenge)}>
        <TrendingUp className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        Update Progress
      </button>
      <button type="button" className="dropdown-item" onClick={() => openWinner(challenge)}>
        <Crown className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        Announce Winner
      </button>
      <div className="menu-sep" />
      <button
        type="button"
        className="dropdown-item danger"
        onClick={() => setDeleteTarget(challenge)}
      >
        <Trash2 className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        Delete
      </button>
    </>
  );

  const top3 = board.slice(0, 3);
  const rest = board.slice(3);
  /* Podium order: 2 · 1 · 3. */
  const podium = [top3[1], top3[0], top3[2]].filter(Boolean);
  const valueOf = (points: number, progress: number) =>
    metric === "progress" ? `${progress}%` : number(points);

  return (
    <>
      {/* Page header */}
      <div className="flex md:items-center justify-between flex-wrap xl:flex-nowrap gap-4 mb-5">
        <div>
          <h2 className="text-xl font-black c-text">Challenges &amp; Leaderboard</h2>
          <p className="text-sm mt-0.5 c-dim">
            Run fitness challenges &amp; keep members motivated · Austin HQ
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="btn-ghost flex items-center gap-2 px-3.5 py-2 text-sm"
            onClick={() => showToast("Leaderboard link copied")}
          >
            <Share2 className="w-[14px] h-[14px] shrink-0" aria-hidden="true" />
            Share
          </button>
          <button
            type="button"
            className="btn-ghost flex items-center gap-2 px-3.5 py-2 text-sm"
            onClick={() => setExportOpen(true)}
          >
            <Download className="w-[14px] h-[14px] shrink-0" aria-hidden="true" />
            Export
          </button>
          <button
            type="button"
            className="btn-gold flex items-center gap-2 px-4 py-2.5 text-sm"
            onClick={() => openForm(null)}
          >
            <Trophy className="w-[14px] h-[14px] shrink-0" aria-hidden="true" />
            New Challenge
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="sc-members reveal">
          <div className="sc-members-chip">
            <Trophy className="w-[18px] h-[18px] c-gold shrink-0" aria-hidden="true" />
          </div>
          <div>
            <div className="text-2xl font-black c-text leading-none">{kpis.active}</div>
            <div className="text-xs font-medium mt-1 c-dim">Active Challenges</div>
          </div>
        </div>
        <div className="sc-members reveal">
          <div className="sc-members-chip">
            <Users className="w-[18px] h-[18px] c-gold shrink-0" aria-hidden="true" />
          </div>
          <div>
            <div className="text-2xl font-black c-text leading-none">
              {kpis.participants}
            </div>
            <div className="text-xs font-medium mt-1 c-dim">Participants</div>
          </div>
        </div>
        <div className="sc-members reveal">
          <div className="sc-members-chip">
            <Flame className="w-[18px] h-[18px] c-gold shrink-0" aria-hidden="true" />
          </div>
          <div>
            <div className="text-2xl font-black c-text leading-none">
              {kpis.completion}%
            </div>
            <div className="text-xs font-medium mt-1 c-dim">Avg Completion</div>
          </div>
        </div>
        <div className="sc-members reveal">
          <div className="sc-members-chip">
            <Gift className="w-[18px] h-[18px] c-gold shrink-0" aria-hidden="true" />
          </div>
          <div>
            <div className="text-2xl font-black c-text leading-none">{kpis.rewards}</div>
            <div className="text-xs font-medium mt-1 c-dim">Rewards Given</div>
          </div>
        </div>
      </div>

      {/* Challenge tabs */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
        {CHALLENGE_TABS.map((name) => {
          const Icon = TAB_ICON[name];
          return (
            <button
              key={name}
              type="button"
              className={name === tab ? "ord-tab active" : "ord-tab"}
              onClick={() => setTab(name)}
            >
              <Icon className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
              {name}
            </button>
          );
        })}
      </div>

      {/* Challenge cards */}
      {visible.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {visible.map((challenge) => {
            const theme = CHALLENGE_THEME[challenge.theme];
            const Icon = CHALLENGE_THEME_ICON[challenge.theme];
            /* Upcoming challenges have no board, so they never highlight. */
            const isActive =
              challenge.id === activeId && challenge.status !== "Upcoming";
            return (
              <div
                key={challenge.id}
                className={isActive ? "ch-card active-card" : "ch-card"}
                onClick={() => setActiveId(challenge.id)}
              >
                <div className={`ch-hero ${theme.hero}`}>
                  <div>
                    <RowMenu
                      triggerClassName="ch-menu-btn"
                      triggerTitle="More"
                      trigger={
                        <MoreVertical
                          className="w-[15px] h-[15px] shrink-0"
                          aria-hidden="true"
                        />
                      }
                    >
                      {menuItemsFor(challenge)}
                    </RowMenu>
                  </div>
                  <span
                    className={`badge ${CHALLENGE_STATUS_BADGE[challenge.status]} ch-badge`}
                  >
                    <span className="dot" />
                    {challenge.status}
                  </span>
                  <Icon className="w-8 h-8 hero-ink shrink-0" aria-hidden="true" />
                </div>
                <div className="p-4">
                  <div className="text-sm font-bold c-text truncate">{challenge.name}</div>
                  <div className="text-[11px] c-dim mt-0.5 flex items-center gap-1">
                    <Clock className="w-[11px] h-[11px] shrink-0" aria-hidden="true" />
                    {challenge.days}
                  </div>
                  <div className="flex items-center gap-3 mt-3 mb-2 text-[11px] c-dim">
                    <span className="flex items-center gap-1">
                      <Users
                        className="w-[11px] h-[11px] c-gold shrink-0"
                        aria-hidden="true"
                      />
                      {challenge.participants}
                    </span>
                    <span className="flex items-center gap-1">
                      <Flame
                        className="w-[11px] h-[11px] c-gold shrink-0"
                        aria-hidden="true"
                      />
                      {challenge.completion}%
                    </span>
                  </div>
                  <div className="prog-track">
                    <div className="prog-bar" style={{ width: `${challenge.completion}%` }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {visible.length === 0 && (
        <div className="text-center py-10 mb-6">
          <div className="text-[38px] opacity-30 mb-2">🏆</div>
          <div className="text-sm font-bold c-text">No challenges here</div>
          <div className="text-xs mt-1 c-dim">Create one to get members moving</div>
        </div>
      )}

      {/* Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold c-text sec-title">
              Leaderboard · <span className="c-gold">{board.length ? selected?.name : "—"}</span>
            </h3>
            <CommonSelect
              className="w-auto"
              fieldClassName="py-1.5 text-xs"
              ariaLabel="Rank by"
              options={METRIC_OPTIONS}
              value={metric}
              onChange={(option) =>
                setMetric((option?.value as LeaderboardMetric) ?? "points")
              }
            />
          </div>
          {board.length ? (
            <>
              <div className="podium mb-5">
                {podium.map((participant) => {
                  const rank =
                    participant === top3[0] ? 1 : participant === top3[1] ? 2 : 3;
                  return (
                    <div key={participant.name} className="pod">
                      <div className="pod-medal">{MEDAL_EMOJI[rank]}</div>
                      <div className={`pod-av pod-av-${rank} ${MEDAL_CLASS[rank]}`}>
                        {initials(participant.name)}
                      </div>
                      <div className="text-center">
                        <div className="text-[12px] font-bold c-text">
                          {participant.name.split(" ")[0]}
                        </div>
                        <div className="text-[11px] c-gold font-black">
                          {valueOf(participant.points, participant.progress)}
                        </div>
                      </div>
                      <div className={`pod-base pod-base-${rank}`}>{rank}</div>
                    </div>
                  );
                })}
              </div>
              <div>
                {rest.map((participant, index) => (
                  <div key={participant.name} className="lb-row">
                    <div className="lb-rank c-dim2">{index + 4}</div>
                    <div className={`lb-av av ${avatarFor(participant.name)}`}>
                      {initials(participant.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-bold c-text truncate">
                        {participant.name}
                      </div>
                      <div className="prog-track mt-1.5 lb-prog">
                        <div
                          className="prog-bar"
                          style={{ width: `${participant.progress}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[14px] font-black c-gold">
                        {valueOf(participant.points, participant.progress)}
                      </div>
                      <div className="text-[10px] c-dim2">
                        {metric === "progress" ? "complete" : "points"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="podium mb-5" />
              <div className="text-center py-8 text-xs c-dim">
                Select an active or completed challenge to see rankings.
              </div>
            </>
          )}
        </div>

        {/* Rewards / rules */}
        <div className="space-y-5">
          <div className="gold-border-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <Award className="w-[16px] h-[16px] c-gold shrink-0" aria-hidden="true" />
              <h3 className="font-bold c-text">Rewards</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="medal medal-gold">🥇</span>
                <div className="flex-1">
                  <div className="text-[13px] font-bold c-text">1st Place</div>
                  <div className="text-[11px] c-dim">3 months free + merch</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="medal medal-silver">🥈</span>
                <div className="flex-1">
                  <div className="text-[13px] font-bold c-text">2nd Place</div>
                  <div className="text-[11px] c-dim">1 month free + shaker</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="medal medal-bronze">🥉</span>
                <div className="flex-1">
                  <div className="text-[13px] font-bold c-text">3rd Place</div>
                  <div className="text-[11px] c-dim">2 free PT sessions</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="medal medal-soft">
                  <Star className="w-[14px] h-[14px] c-gold shrink-0" aria-hidden="true" />
                </span>
                <div className="flex-1">
                  <div className="text-[13px] font-bold c-text">All finishers</div>
                  <div className="text-[11px] c-dim">500 loyalty points</div>
                </div>
              </div>
            </div>
          </div>
          <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-[16px] h-[16px] c-gold shrink-0" aria-hidden="true" />
              <h3 className="font-bold c-text">How It Works</h3>
            </div>
            <ul className="space-y-2.5 text-[13px] c-dim">
              {[
                "Earn points for every logged workout & check-in.",
                "Bonus points for hitting weekly targets.",
                "Leaderboard updates live as members progress.",
                "Top 3 win at the end of the challenge period.",
              ].map((line) => (
                <li key={line} className="flex gap-2">
                  <Check
                    className="w-[14px] h-[14px] c-green shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  {line}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Keyed so switching between new and edit reseeds the fields. */}
      <ChallengeFormModal
        key={editing?.id ?? "new"}
        open={formOpen}
        challenge={editing}
        onClose={() => setFormOpen(false)}
        onSave={(input) => {
          saveChallenge(input);
          // Creating switches to the tab the challenge landed on.
          if (input.id == null) setTab(input.status);
          showToast(input.id != null ? "Challenge updated" : "Challenge created");
        }}
        onInvalid={() => showToast("Enter a challenge name")}
      />
      <ChallengeViewModal
        challenge={view}
        board={sortedBoard(view)}
        onClose={() => setView(null)}
        onJoin={(challenge) => {
          setView(null);
          setJoinTarget(challenge);
        }}
        onWinner={(challenge) => {
          setView(null);
          openWinner(challenge);
        }}
      />
      <JoinChallengeModal
        key={joinTarget?.id ?? "join"}
        challenge={joinTarget}
        onClose={() => setJoinTarget(null)}
        onJoin={(challenge, name, points, progress) => {
          joinChallenge(challenge.id, name, points, progress);
          setJoinTarget(null);
          showToast(`${name} joined ${challenge.name}`);
        }}
      />
      <UpdateProgressModal
        key={progressTarget?.id ?? "progress"}
        challenge={progressTarget}
        onClose={() => setProgressTarget(null)}
        onUpdate={(challenge, index, points, progress) => {
          updateProgress(challenge.id, index, points, progress);
          setProgressTarget(null);
          showToast(
            `Progress updated for ${challenge.board[index]?.name ?? "member"}`,
          );
        }}
      />
      <AnnounceWinnerModal
        key={winnerTarget?.id ?? "winner"}
        challenge={winnerTarget}
        board={sortedBoard(winnerTarget)}
        onClose={() => setWinnerTarget(null)}
        onAnnounce={(challenge, complete, winner) => {
          announceWinner(challenge.id, complete);
          setWinnerTarget(null);
          showToast(`🏆 ${winner?.name ?? "Winner"} announced as champion!`);
        }}
      />
      <DeleteChallengeModal
        challenge={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={(challenge) => {
          removeChallenge(challenge.id);
          setDeleteTarget(null);
          showToast(`${challenge.name} deleted`);
        }}
      />
      <ChallengeExportModal
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        onExport={(format, scope) => {
          const count = scope === "all" ? "all challenges" : selected?.name ?? "challenge";
          showToast(`Exported ${count} as ${format}`);
        }}
      />
      <Toast message={message} visible={toastVisible} />
    </>
  );
};

export default Challenges;

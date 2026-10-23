import { useState } from "react";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Copy,
  Download,
  Edit2,
  Eye,
  Gift,
  Link as LinkIcon,
  Megaphone,
  MessageCircle,
  MoreVertical,
  Percent,
  Search,
  Send,
  Share2,
  Trash2,
  Trophy,
  UserCheck,
  UserPlus,
  XCircle,
} from "lucide-react";
import RowMenu from "../../components/common/rowMenu";
import Toast from "../../components/common/Toast";
import useToast from "../../hooks/useToast";
import type { Referral } from "../../types/referrals";
import {
  REFERRAL_CODE,
  REFERRAL_STATUS_BADGE,
} from "../../utils/json/referralsData";
import { avatarFor, initials, moneyWhole } from "../../utils/formatUtils";
import useReferrals, { REFERRAL_TABS, type ReferralTab } from "./useReferrals";
import AddReferralModal from "./modal/addReferralModal";
import EditReferralModal from "./modal/editReferralModal";
import ReferralViewModal from "./modal/referralViewModal";
import SendInvitationModal from "./modal/sendInvitationModal";
import RewardReferralModal from "./modal/rewardReferralModal";
import ReferralConfirmModal from "./modal/referralConfirmModal";
import ReferralExportModal from "./modal/referralExportModal";

/*
   Referrals — ported from tailwind/src/referrals.html +
   assets/js/referrals.js.
*/

const TAB_ICON: Record<ReferralTab, typeof Send | null> = {
  All: null,
  Invited: Send,
  "Signed Up": UserPlus,
  Converted: CheckCircle2,
};

const MEDALS = ["🥇", "🥈", "🥉"];

const Referrals = () => {
  const {
    referrals,
    visible,
    kpis,
    counts,
    funnel,
    topReferrers,
    tab,
    setTab,
    search,
    setSearch,
    advance,
    approve,
    reject,
    payReward,
    addReferral,
    saveReferral,
    removeReferral,
  } = useReferrals();
  const { message, visible: toastVisible, showToast } = useToast();

  const [addOpen, setAddOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [view, setView] = useState<Referral | null>(null);
  const [editTarget, setEditTarget] = useState<Referral | null>(null);
  const [rewardTarget, setRewardTarget] = useState<Referral | null>(null);
  const [approveTarget, setApproveTarget] = useState<Referral | null>(null);
  const [rejectTarget, setRejectTarget] = useState<Referral | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Referral | null>(null);

  /* Mirrors the template's copy() with its silent clipboard fallback. */
  const copy = (text: string, toastText: string) => {
    navigator.clipboard?.writeText(text).catch(() => {});
    showToast(toastText);
  };

  const doAdvance = (referral: Referral) => {
    const result = advance(referral.id);
    if (!result.moved) {
      showToast("Already at final stage");
      return;
    }
    showToast(
      `${referral.friend} → ${result.status}${result.status === "Converted" ? " 🎉" : ""}`,
    );
  };

  const menuItemsFor = (referral: Referral) => (
    <>
      <button type="button" className="dropdown-item" onClick={() => setView(referral)}>
        <Eye className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        View
      </button>
      <button type="button" className="dropdown-item" onClick={() => setEditTarget(referral)}>
        <Edit2 className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        Edit
      </button>
      <button type="button" className="dropdown-item" onClick={() => doAdvance(referral)}>
        <ArrowRight className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        Advance Stage
      </button>
      <button
        type="button"
        className="dropdown-item"
        onClick={() => setApproveTarget(referral)}
      >
        <Check className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        Approve
      </button>
      <button
        type="button"
        className="dropdown-item"
        onClick={() => setRejectTarget(referral)}
      >
        <XCircle className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        Reject
      </button>
      <button
        type="button"
        className="dropdown-item"
        onClick={() => setRewardTarget(referral)}
      >
        <Gift className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        Reward
      </button>
      <div className="menu-sep" />
      <button
        type="button"
        className="dropdown-item danger"
        onClick={() => setDeleteTarget(referral)}
      >
        <Trash2 className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        Delete
      </button>
    </>
  );

  return (
    <>
      {/* Page header */}
      <div className="flex md:items-center justify-between flex-wrap xl:flex-nowrap gap-4 mb-5">
        <div>
          <h2 className="text-xl font-black c-text">Referrals</h2>
          <p className="text-sm mt-0.5 c-dim">
            Member-get-member program &amp; rewards · Austin HQ
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
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
            className="btn-ghost flex items-center gap-2 px-3.5 py-2 text-sm"
            onClick={() => setInviteOpen(true)}
          >
            <Send className="w-[14px] h-[14px] shrink-0" aria-hidden="true" />
            Send Invitation
          </button>
          <button
            type="button"
            className="btn-gold flex items-center gap-2 px-4 py-2.5 text-sm"
            onClick={() => setAddOpen(true)}
          >
            <UserPlus className="w-[14px] h-[14px] shrink-0" aria-hidden="true" />
            Add Referral
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="sc-members reveal">
          <div className="sc-members-chip">
            <Share2 className="w-[18px] h-[18px] c-gold shrink-0" aria-hidden="true" />
          </div>
          <div>
            <div className="text-2xl font-black c-text leading-none">{kpis.total}</div>
            <div className="text-xs font-medium mt-1 c-dim">Total Referrals</div>
          </div>
        </div>
        <div className="sc-members reveal">
          <div className="sc-members-chip">
            <UserCheck className="w-[18px] h-[18px] c-gold shrink-0" aria-hidden="true" />
          </div>
          <div>
            <div className="text-2xl font-black c-text leading-none">{kpis.converted}</div>
            <div className="text-xs font-medium mt-1 c-dim">Converted</div>
          </div>
        </div>
        <div className="sc-members reveal">
          <div className="sc-members-chip">
            <Percent className="w-[18px] h-[18px] c-gold shrink-0" aria-hidden="true" />
          </div>
          <div>
            <div className="text-2xl font-black c-text leading-none">{kpis.rate}%</div>
            <div className="text-xs font-medium mt-1 c-dim">Conversion Rate</div>
          </div>
        </div>
        <div className="sc-members reveal">
          <div className="sc-members-chip">
            <Gift className="w-[18px] h-[18px] c-gold shrink-0" aria-hidden="true" />
          </div>
          <div>
            <div className="text-2xl font-black c-text leading-none">
              {moneyWhole(kpis.rewards)}
            </div>
            <div className="text-xs font-medium mt-1 c-dim">Rewards Paid</div>
          </div>
        </div>
      </div>

      {/* Code banner + funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        <div className="code-hero lg:col-span-1">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Megaphone className="w-[15px] h-[15px] c-gold shrink-0" aria-hidden="true" />
              <span className="text-[12px] font-bold c-text">Program Offer</span>
            </div>
            <div className="text-sm c-dim leading-relaxed mb-3">
              Members earn <b className="c-gold">$50 credit</b> for every friend who joins.
              Friend gets <b className="c-gold">20% off</b>.
            </div>
            <div className="text-[10px] font-black uppercase tracking-wider c-dim2 mb-1.5">
              Shared referral code
            </div>
            <div className="code-box mb-3">
              <span className="code-txt">{REFERRAL_CODE}</span>
              <button
                type="button"
                className="copy-btn link-btn text-[11px] font-bold c-dim hover:text-gold flex items-center gap-1"
                onClick={() => copy(REFERRAL_CODE, `Copied "${REFERRAL_CODE}"`)}
              >
                <Copy className="w-3 h-3 shrink-0" aria-hidden="true" />
                Copy
              </button>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                className="btn-ghost px-3 py-1.5 text-xs flex items-center gap-1.5"
                onClick={() => showToast("Opening WhatsApp share…")}
              >
                <MessageCircle className="w-[12px] h-[12px] shrink-0" aria-hidden="true" />
                WhatsApp
              </button>
              <button
                type="button"
                className="btn-ghost px-3 py-1.5 text-xs flex items-center gap-1.5"
                onClick={() => copy(REFERRAL_CODE, "Referral link copied")}
              >
                <LinkIcon className="w-[12px] h-[12px] shrink-0" aria-hidden="true" />
                Copy Link
              </button>
            </div>
          </div>
        </div>

        <div className="glass-card p-5 lg:col-span-2">
          <h3 className="font-bold c-text sec-title mb-4">Referral Funnel</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="fn-step fn-gold">
              <div className="fn-ic fn-ic-gold">
                <Send className="w-[18px] h-[18px] c-gold shrink-0" aria-hidden="true" />
              </div>
              <div className="text-xl font-black c-text leading-none">{funnel.invited}</div>
              <div className="text-[11px] c-dim mt-1">Invited</div>
              <div className="text-[10px] font-bold mt-0.5 c-gold">100%</div>
            </div>
            <div className="fn-step fn-cyan">
              <div className="fn-ic fn-ic-cyan">
                <UserPlus className="w-[18px] h-[18px] c-cyan shrink-0" aria-hidden="true" />
              </div>
              <div className="text-xl font-black c-text leading-none">{funnel.signed}</div>
              <div className="text-[11px] c-dim mt-1">Signed Up</div>
              <div className="text-[10px] font-bold mt-0.5 c-cyan">{funnel.signedPct}%</div>
            </div>
            <div className="fn-step fn-green">
              <div className="fn-ic fn-ic-green">
                <UserCheck
                  className="w-[18px] h-[18px] c-green shrink-0"
                  aria-hidden="true"
                />
              </div>
              <div className="text-xl font-black c-text leading-none">
                {funnel.converted}
              </div>
              <div className="text-[11px] c-dim mt-1">Converted</div>
              <div className="text-[10px] font-bold mt-0.5 c-green">
                {funnel.convertedPct}%
              </div>
            </div>
            <div className="fn-step fn-purple">
              <div className="fn-ic fn-ic-purple">
                <Gift className="w-[18px] h-[18px] c-purple shrink-0" aria-hidden="true" />
              </div>
              <div className="text-xl font-black c-text leading-none">
                {moneyWhole(funnel.rewards)}
              </div>
              <div className="text-[11px] c-dim mt-1">Rewards</div>
              <div className="text-[10px] font-bold mt-0.5 c-purple">paid out</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Referrals table */}
        <div className="xl:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {REFERRAL_TABS.map((name) => {
                const Icon = TAB_ICON[name];
                return (
                  <button
                    key={name}
                    type="button"
                    className={name === tab ? "ord-tab active" : "ord-tab"}
                    onClick={() => setTab(name)}
                  >
                    {Icon && <Icon className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />}
                    {name} <span className="cnt">{counts[name]}</span>
                  </button>
                );
              })}
            </div>
            <div className="relative min-w-[160px]">
              <Search
                className="search-icon absolute left-3 top-1/2 -translate-y-1/2 w-[14px] h-[14px] shrink-0"
                aria-hidden="true"
              />
              <input
                type="text"
                className="fp-input pl-9 py-2 text-sm"
                placeholder="Search…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="data-table table-sticky min-w-[720px]">
                <thead>
                  <tr>
                    <th>Referred Friend</th>
                    <th>Referred By</th>
                    <th>Date</th>
                    <th>Reward</th>
                    <th>Status</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((referral) => (
                    <tr key={referral.id}>
                      <td>
                        <div className="flex items-center gap-2.5">
                          <div className={`ref-avatar av ${avatarFor(referral.friend)}`}>
                            {initials(referral.friend)}
                          </div>
                          <span className="font-semibold c-text">{referral.friend}</span>
                        </div>
                      </td>
                      <td className="c-text2">{referral.by}</td>
                      <td className="text-[12px] c-dim">{referral.date}</td>
                      <td className={referral.reward ? "font-bold c-gold" : "font-bold c-dim2"}>
                        {referral.reward ? moneyWhole(referral.reward) : "—"}
                      </td>
                      <td>
                        <span className={`badge ${REFERRAL_STATUS_BADGE[referral.status]}`}>
                          <span className="dot" />
                          {referral.status}
                        </span>
                      </td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            className="icon-btn"
                            title="View"
                            onClick={() => setView(referral)}
                          >
                            <Eye className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
                          </button>
                          <RowMenu
                            triggerTitle="More"
                            trigger={
                              <MoreVertical
                                className="w-[15px] h-[15px] shrink-0"
                                aria-hidden="true"
                              />
                            }
                          >
                            {menuItemsFor(referral)}
                          </RowMenu>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {visible.length === 0 && (
              <div className="text-center py-14">
                <div className="text-[38px] opacity-30 mb-2">🤝</div>
                <div className="text-sm font-bold c-text">No referrals found</div>
                <div className="text-xs mt-1 c-dim">Try a different tab or search</div>
              </div>
            )}
            <div className="flex items-center justify-between px-4 py-3 bd-t">
              <span className="text-xs c-dim2">
                Showing <span>{visible.length}</span> of <span>{referrals.length}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Top referrers */}
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-[16px] h-[16px] c-gold shrink-0" aria-hidden="true" />
            <h3 className="font-bold c-text">Top Referrers</h3>
          </div>
          <div className="space-y-2.5">
            {topReferrers.map((referrer, index) => (
              <div key={referrer.name} className="tr-row">
                {index < 3 ? (
                  <span className="tr-medal tr-medal-gold">{MEDALS[index]}</span>
                ) : (
                  <span className="tr-medal tr-medal-num c-dim2 font-black">{index + 1}</span>
                )}
                <div className={`ref-avatar ref-av-sm av ${avatarFor(referrer.name)}`}>
                  {initials(referrer.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-bold c-text truncate">{referrer.name}</div>
                  <div className="text-[11px] c-dim">
                    {referrer.conv} converted · {referrer.total} invited
                  </div>
                </div>
                <div className="text-[13px] font-black c-gold">
                  {moneyWhole(referrer.earned)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <AddReferralModal
        key={addOpen ? "add-open" : "add-closed"}
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onAdd={(friend, by, phone) => {
          addReferral(friend, by, phone);
          showToast(`Invite sent to ${friend.trim()}`);
        }}
      />
      {/* Keyed so a different referral reseeds the form. */}
      <EditReferralModal
        key={editTarget?.id ?? "edit"}
        referral={editTarget}
        onClose={() => setEditTarget(null)}
        onSave={(input) => {
          saveReferral(input);
          setEditTarget(null);
          showToast("Referral updated");
        }}
      />
      <ReferralViewModal
        referral={view}
        onClose={() => setView(null)}
        onApprove={(referral) => {
          setView(null);
          setApproveTarget(referral);
        }}
        onReward={(referral) => {
          setView(null);
          setRewardTarget(referral);
        }}
      />
      <SendInvitationModal
        key={inviteOpen ? "invite-open" : "invite-closed"}
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        onSend={(channel, to) =>
          showToast(`Invitation sent via ${channel}${to ? ` to ${to}` : ""}`)
        }
      />
      <RewardReferralModal
        key={rewardTarget?.id ?? "reward"}
        referral={rewardTarget}
        onClose={() => setRewardTarget(null)}
        onPay={(referral, amount) => {
          payReward(referral.id, amount);
          setRewardTarget(null);
          showToast(`Reward of ${moneyWhole(amount)} paid to ${referral.by}`);
        }}
      />
      <ReferralConfirmModal
        open={approveTarget !== null}
        onClose={() => setApproveTarget(null)}
        icon={<CheckCircle2 className="w-6 h-6 c-green shrink-0" aria-hidden="true" />}
        iconClassName="danger-ic bg-[rgba(74,222,128,0.1)]! border-[rgba(74,222,128,0.2)]!"
        title="Approve Referral?"
        body={
          <>
            Mark{" "}
            <span className="font-semibold c-text">
              {approveTarget?.friend ?? "this referral"}
            </span>{" "}
            as converted and release the reward.
          </>
        }
        confirmLabel="Approve"
        confirmClassName="btn-gold"
        onConfirm={() => {
          if (!approveTarget) return;
          approve(approveTarget.id);
          showToast(`${approveTarget.friend} approved 🎉`);
          setApproveTarget(null);
        }}
      />
      <ReferralConfirmModal
        open={rejectTarget !== null}
        onClose={() => setRejectTarget(null)}
        icon={<XCircle className="w-6 h-6 c-orange shrink-0" aria-hidden="true" />}
        iconClassName="danger-ic warn-ic"
        title="Reject Referral?"
        body={
          <>
            Mark{" "}
            <span className="font-semibold c-text">
              {rejectTarget?.friend ?? "this referral"}
            </span>{" "}
            as expired. No reward will be paid.
          </>
        }
        confirmLabel="Reject"
        confirmClassName="btn-danger"
        onConfirm={() => {
          if (!rejectTarget) return;
          reject(rejectTarget.id);
          showToast(`${rejectTarget.friend} rejected`);
          setRejectTarget(null);
        }}
      />
      <ReferralConfirmModal
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        icon={<Trash2 className="w-6 h-6 c-red shrink-0" aria-hidden="true" />}
        iconClassName="danger-ic"
        title="Delete Referral?"
        body={
          <>
            Delete the referral for{" "}
            <span className="font-semibold c-text">
              {deleteTarget?.friend ?? "this friend"}
            </span>
            ? This action cannot be undone.
          </>
        }
        confirmLabel="Delete"
        confirmClassName="btn-danger"
        onConfirm={() => {
          if (!deleteTarget) return;
          removeReferral(deleteTarget.id);
          showToast(`${deleteTarget.friend} removed`);
          setDeleteTarget(null);
        }}
      />
      <ReferralExportModal
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        onExport={(format, scope) => {
          const count = scope === "all" ? referrals.length : visible.length;
          showToast(`Exported ${count} referrals as ${format}`);
        }}
      />
      <Toast message={message} visible={toastVisible} />
    </>
  );
};

export default Referrals;

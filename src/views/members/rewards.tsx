import { useState } from "react";
import {
  Coins,
  Download,
  Edit2,
  Eye,
  Gift,
  MoreVertical,
  Plus,
  Settings,
  SlidersHorizontal,
  Trash2,
  Users,
  Wallet,
} from "lucide-react";
import RowMenu from "../../components/common/rowMenu";
import Toast from "../../components/common/Toast";
import useToast from "../../hooks/useToast";
import type { Reward } from "../../types/rewards";
import {
  CATEGORY_THEME,
  EXPORT_SETS,
  LOW_STOCK,
  TIERS,
  UNLIMITED_STOCK,
} from "../../utils/json/rewardsData";
import { avatarFor, initials, number } from "../../utils/formatUtils";
import { CATEGORY_ICON, TIER_ICON } from "./rewardIcons";
import useRewards, { CATEGORY_TABS, type CategoryTab } from "./useRewards";
import RedeemRewardModal from "./modal/redeemRewardModal";
import RewardFormModal from "./modal/rewardFormModal";
import RewardViewModal from "./modal/rewardViewModal";
import AssignPointsModal from "./modal/assignPointsModal";
import AdjustPointsModal from "./modal/adjustPointsModal";
import DeleteRewardModal from "./modal/deleteRewardModal";
import EarningRulesModal from "./modal/earningRulesModal";
import RewardExportModal from "./modal/rewardExportModal";

/*
   Rewards & Loyalty — ported from tailwind/src/rewards.html +
   assets/js/rewards.js.

   The catalog tab labelled "Merch" filters on the full "Merchandise"
   category, which is how the template's data-cat attribute was set.
*/

const TAB_LABEL: Record<CategoryTab, string> = {
  All: "All",
  Membership: "Membership",
  Merchandise: "Merch",
  Services: "Services",
  "F&B": "F&B",
};

const Rewards = () => {
  const {
    visible,
    members,
    redemptions,
    rules,
    kpis,
    cat,
    setCat,
    redeem,
    saveReward,
    removeReward,
    assignPoints,
    adjustPoints,
    saveRules,
    resetRules,
  } = useRewards();
  const { message, visible: toastVisible, showToast } = useToast();

  const [redeemTarget, setRedeemTarget] = useState<Reward | null>(null);
  const [view, setView] = useState<Reward | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Reward | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Reward | null>(null);
  const [assignOpen, setAssignOpen] = useState(false);
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

  const openForm = (reward: Reward | null) => {
    setEditing(reward);
    setFormOpen(true);
  };

  const menuItemsFor = (reward: Reward) => (
    <>
      <button type="button" className="dropdown-item" onClick={() => setView(reward)}>
        <Eye className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        View
      </button>
      <button type="button" className="dropdown-item" onClick={() => openForm(reward)}>
        <Edit2 className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        Edit
      </button>
      <button
        type="button"
        className="dropdown-item"
        onClick={() => setRedeemTarget(reward)}
      >
        <Gift className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        Redeem
      </button>
      <div className="menu-sep" />
      <button
        type="button"
        className="dropdown-item danger"
        onClick={() => setDeleteTarget(reward)}
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
          <h2 className="text-xl font-black c-text">Rewards &amp; Loyalty</h2>
          <p className="text-sm mt-0.5 c-dim">
            Points, membership tiers &amp; redemptions · Austin HQ
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="btn-ghost flex items-center gap-2 px-3.5 py-2 text-sm"
            onClick={() => setRulesOpen(true)}
          >
            <Settings className="w-[14px] h-[14px] shrink-0" aria-hidden="true" />
            Earning Rules
          </button>
          <button
            type="button"
            className="btn-ghost flex items-center gap-2 px-3.5 py-2 text-sm"
            onClick={() => setAssignOpen(true)}
          >
            <Coins className="w-[14px] h-[14px] shrink-0" aria-hidden="true" />
            Assign Points
          </button>
          <button
            type="button"
            className="btn-ghost flex items-center gap-2 px-3.5 py-2 text-sm"
            onClick={() => setAdjustOpen(true)}
          >
            <SlidersHorizontal
              className="w-[14px] h-[14px] shrink-0"
              aria-hidden="true"
            />
            Adjust Points
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
            <Plus className="w-[14px] h-[14px] shrink-0" aria-hidden="true" />
            Add Reward
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="sc-members reveal">
          <div className="sc-members-chip">
            <Coins className="w-[18px] h-[18px] c-gold shrink-0" aria-hidden="true" />
          </div>
          <div>
            <div className="text-2xl font-black c-text leading-none">
              {number(kpis.issued)}
            </div>
            <div className="text-xs font-medium mt-1 c-dim">Points Issued</div>
          </div>
        </div>
        <div className="sc-members reveal">
          <div className="sc-members-chip">
            <Gift className="w-[18px] h-[18px] c-gold shrink-0" aria-hidden="true" />
          </div>
          <div>
            <div className="text-2xl font-black c-text leading-none">
              {number(kpis.redeemed)}
            </div>
            <div className="text-xs font-medium mt-1 c-dim">Points Redeemed</div>
          </div>
        </div>
        <div className="sc-members reveal">
          <div className="sc-members-chip">
            <Wallet className="w-[18px] h-[18px] c-gold shrink-0" aria-hidden="true" />
          </div>
          <div>
            <div className="text-2xl font-black c-text leading-none">
              {number(kpis.outstanding)}
            </div>
            <div className="text-xs font-medium mt-1 c-dim">Outstanding Balance</div>
          </div>
        </div>
        <div className="sc-members reveal">
          <div className="sc-members-chip">
            <Users className="w-[18px] h-[18px] c-gold shrink-0" aria-hidden="true" />
          </div>
          <div>
            <div className="text-2xl font-black c-text leading-none">
              {number(kpis.members)}
            </div>
            <div className="text-xs font-medium mt-1 c-dim">Enrolled Members</div>
          </div>
        </div>
      </div>

      {/* Tiers */}
      <h3 className="font-bold c-text sec-title mb-3">Membership Tiers</h3>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {TIERS.map((tier) => {
          const Icon = TIER_ICON[tier.name];
          return (
            <div key={tier.name} className={`tier-card ${tier.tint}`}>
              <div className={`tier-count ${tier.cnt}`}>{tier.members}</div>
              <div className={`tier-ic ${tier.ic}`}>
                <Icon className="w-5 h-5 hero-ink shrink-0" aria-hidden="true" />
              </div>
              <div className="text-sm font-black c-text">{tier.name}</div>
              <div className="text-[11px] c-dim mt-0.5">{number(tier.min)}+ points</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Reward catalog */}
        <div className="xl:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h3 className="font-bold c-text sec-title">Rewards Catalog</h3>
            <div className="flex items-center gap-2 overflow-x-auto">
              {CATEGORY_TABS.map((name) => (
                <button
                  key={name}
                  type="button"
                  className={name === cat ? "ord-tab active" : "ord-tab"}
                  onClick={() => setCat(name)}
                >
                  {TAB_LABEL[name]}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {visible.map((reward) => {
              const theme = CATEGORY_THEME[reward.cat];
              const Icon = CATEGORY_ICON[reward.cat];
              const low = reward.stock <= LOW_STOCK;
              return (
                <div key={reward.id} className="reward-card">
                  <div className={`reward-hero ${theme.hero}`}>
                    <div className="rw-menu-btn">
                      <RowMenu
                        triggerClassName="rw-menu-btn"
                        triggerTitle="More"
                        trigger={
                          <MoreVertical
                            className="w-[14px] h-[14px] shrink-0"
                            aria-hidden="true"
                          />
                        }
                      >
                        {menuItemsFor(reward)}
                      </RowMenu>
                    </div>
                    <Icon className="w-7 h-7 hero-ink shrink-0" aria-hidden="true" />
                  </div>
                  <div className="p-4">
                    <div className="text-[13px] font-bold c-text">{reward.name}</div>
                    <div className="text-[11px] c-dim mt-0.5 mb-3">{reward.desc}</div>
                    <div className="flex items-center justify-between">
                      <span className="pts-cost">
                        <Coins className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
                        {number(reward.cost)}
                      </span>
                      <span className={`text-[10px] ${low ? "c-orange" : "c-dim2"}`}>
                        {reward.stock > UNLIMITED_STOCK
                          ? "Unlimited"
                          : `${reward.stock} left`}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="btn-gold w-full mt-3 py-1.5 text-xs flex items-center justify-center gap-1.5"
                      onClick={() => setRedeemTarget(reward)}
                    >
                      <Gift className="w-[12px] h-[12px] shrink-0" aria-hidden="true" />
                      Redeem
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent redemptions */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold c-text sec-title">Recent Redemptions</h3>
            <button
              type="button"
              className="text-[11px] c-gold font-semibold"
              onClick={() => showToast("Opening full redemption history…")}
            >
              View all
            </button>
          </div>
          <div className="space-y-3">
            {redemptions.slice(0, 8).map((entry, index) => (
              <div key={`${entry.member}-${index}`} className="flex items-center gap-3">
                <div className={`ref-avatar av ${avatarFor(entry.member)}`}>
                  {initials(entry.member)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold c-text truncate">
                    {entry.member}
                  </div>
                  <div className="text-[11px] c-dim">
                    {entry.reward} · {entry.when}
                  </div>
                </div>
                <div className="text-[13px] font-black c-red">−{number(entry.pts)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Keyed so a different reward reseeds the member picker. */}
      <RedeemRewardModal
        key={redeemTarget?.id ?? "redeem"}
        reward={redeemTarget}
        members={members}
        onClose={() => setRedeemTarget(null)}
        onRedeem={(reward, member) => {
          redeem(reward, member.name);
          setRedeemTarget(null);
          setView(null);
          showToast(`${member.name} redeemed ${reward.name} 🎁`);
        }}
      />
      <RewardFormModal
        key={editing?.id ?? "add"}
        open={formOpen}
        reward={editing}
        onClose={() => setFormOpen(false)}
        onSave={(input) => {
          saveReward(input);
          showToast(input.id != null ? "Reward updated" : "Reward added");
        }}
        onInvalid={() => showToast("Enter a reward name")}
      />
      <RewardViewModal
        reward={view}
        onClose={() => setView(null)}
        onEdit={(reward) => {
          setView(null);
          openForm(reward);
        }}
        onRedeem={(reward) => {
          setView(null);
          setRedeemTarget(reward);
        }}
      />
      <AssignPointsModal
        key={assignOpen ? "assign-open" : "assign-closed"}
        open={assignOpen}
        members={members}
        onClose={() => setAssignOpen(false)}
        onAssign={(member, points, reason) => {
          assignPoints(member.name, points);
          setAssignOpen(false);
          showToast(`+${number(points)} pts to ${member.name} (${reason})`);
        }}
      />
      <AdjustPointsModal
        key={adjustOpen ? "adjust-open" : "adjust-closed"}
        open={adjustOpen}
        members={members}
        onClose={() => setAdjustOpen(false)}
        onAdjust={(member, delta) => {
          adjustPoints(member.name, delta);
          setAdjustOpen(false);
          showToast(
            `Adjusted ${member.name} by ${delta >= 0 ? "+" : ""}${number(delta)} pts`,
          );
        }}
      />
      <DeleteRewardModal
        reward={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={(reward) => {
          removeReward(reward.id);
          setDeleteTarget(null);
          showToast(`${reward.name} deleted`);
        }}
      />
      <EarningRulesModal
        key={rulesOpen ? "rules-open" : "rules-closed"}
        open={rulesOpen}
        rules={rules}
        onClose={() => setRulesOpen(false)}
        onSave={(next) => {
          saveRules(next);
          showToast("Earning rules saved");
        }}
        onReset={() => {
          resetRules();
          showToast("Rules reset to defaults");
        }}
      />
      <RewardExportModal
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        onExport={(dataset, format) => {
          const label =
            EXPORT_SETS.find((item) => item.value === dataset)?.label ?? dataset;
          showToast(`Exported ${label} as ${format}`);
        }}
      />
      <Toast message={message} visible={toastVisible} />
    </>
  );
};

export default Rewards;

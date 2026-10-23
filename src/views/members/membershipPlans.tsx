import { useState } from "react";
import {
  Copy,
  DollarSign,
  Download,
  Edit2,
  Eye,
  LayoutGrid,
  List,
  MoreHorizontal,
  MoreVertical,
  PauseCircle,
  PlayCircle,
  Plus,
  RefreshCw,
  Search,
  Star,
  Trash2,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";
import RowMenu from "../../components/common/rowMenu";
import Toast from "../../components/common/Toast";
import CommonSelect from "../../components/common-select/commonSelect";
import useToast from "../../hooks/useToast";
import type {
  MembershipPlan,
  PlanCardView,
  PlanSort,
} from "../../types/membershipPlans";
import {
  CATEGORY_OPTIONS,
  PLAN_KPIS,
  PLAN_STATUS_BADGE,
  PLAN_STATUS_OPTIONS,
} from "../../utils/json/membershipPlansData";
import { moneyWhole } from "../../utils/formatUtils";
import useMembershipPlans, {
  type CategoryFilter,
  type PlanStatusFilter,
} from "./useMembershipPlans";
import PlanFormModal from "./modal/planFormModal";
import ViewPlanModal from "./modal/viewPlanModal";
import DeletePlanModal from "./modal/deletePlanModal";
import AssignPlanModal from "./modal/assignPlanModal";
import RenewPlanModal from "./modal/renewPlanModal";

/*
   Membership Plans — ported from tailwind/src/membership-plans.html +
   assets/js/membership-plans.js.

   The featured strip shows the first four plans and switches between a
   4-column grid and a 2-column list, exactly as setPlanView() did by
   rewriting the container's className.
*/

const toOptions = (values: readonly string[]) =>
  values.map((value) => ({ value, label: value }));

const CATEGORY_FILTER_OPTIONS = [
  { value: "All", label: "All Categories" },
  ...toOptions(CATEGORY_OPTIONS),
];

const STATUS_FILTER_OPTIONS = [
  { value: "All", label: "All Status" },
  ...toOptions(PLAN_STATUS_OPTIONS),
];

const SORT_OPTIONS = [
  { value: "pop", label: "Sort: Popularity" },
  { value: "low", label: "Price: Low → High" },
  { value: "high", label: "Price: High → Low" },
];

const MembershipPlans = () => {
  const {
    plans,
    featured,
    visible,
    search,
    setSearch,
    cat,
    setCat,
    status,
    setStatus,
    sort,
    setSort,
    toggleStatus,
    duplicatePlan,
    removePlan,
    enrol,
    savePlan,
  } = useMembershipPlans();
  const { message, visible: toastVisible, showToast } = useToast();

  const [cardView, setCardView] = useState<PlanCardView>("grid");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<MembershipPlan | null>(null);
  const [view, setView] = useState<MembershipPlan | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MembershipPlan | null>(null);
  const [assignTarget, setAssignTarget] = useState<MembershipPlan | null>(null);
  const [renewTarget, setRenewTarget] = useState<MembershipPlan | null>(null);

  const openAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (plan: MembershipPlan) => {
    setView(null);
    setEditing(plan);
    setFormOpen(true);
  };

  const toggle = (plan: MembershipPlan) => {
    toggleStatus(plan.id);
    showToast(`${plan.name} → ${plan.status === "Active" ? "Inactive" : "Active"}`);
  };
  const duplicate = (plan: MembershipPlan) => {
    duplicatePlan(plan.id);
    showToast(`${plan.name} duplicated`);
  };

  /* Shared by the featured cards and the table rows. */
  const menuItemsFor = (plan: MembershipPlan) => (
    <>
      <button
        type="button"
        className="dropdown-item"
        onClick={() => setAssignTarget(plan)}
      >
        <UserPlus className="w-4 h-4 shrink-0" aria-hidden="true" />
        Assign Plan
      </button>
      <button type="button" className="dropdown-item" onClick={() => setRenewTarget(plan)}>
        <RefreshCw className="w-4 h-4 shrink-0" aria-hidden="true" />
        Renew Subscription
      </button>
      <button type="button" className="dropdown-item" onClick={() => duplicate(plan)}>
        <Copy className="w-4 h-4 shrink-0" aria-hidden="true" />
        Duplicate
      </button>
      <button type="button" className="dropdown-item" onClick={() => toggle(plan)}>
        {plan.status === "Active" ? (
          <PauseCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
        ) : (
          <PlayCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
        )}
        {plan.status === "Active" ? "Deactivate" : "Activate"}
      </button>
      <div className="menu-sep" />
      <button
        type="button"
        className="dropdown-item danger"
        onClick={() => setDeleteTarget(plan)}
      >
        <Trash2 className="w-4 h-4 shrink-0" aria-hidden="true" />
        Delete
      </button>
    </>
  );

  return (
    <>
      {/* Page header */}
      <div className="flex md:items-center justify-between flex-wrap xl:flex-nowrap gap-4 mb-5">
        <div>
          <h2 className="text-xl font-black c-text">Membership Plans</h2>
          <p className="text-sm mt-0.5 c-dim">
            Configure tiers, pricing &amp; benefits · {PLAN_KPIS.totalPlans} active plans
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="badge-active text-[11px] font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            All Live
          </span>
          <button
            type="button"
            className="btn-gold flex items-center gap-2 px-4 py-2.5 text-sm"
            onClick={openAdd}
          >
            <Plus className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            Add Plan
          </button>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="sc-members reveal">
          <div className="sc-members-chip">
            <Star className="w-[18px] h-[18px] c-gold shrink-0" aria-hidden="true" />
          </div>
          <div>
            <div className="text-xl font-black c-text">{PLAN_KPIS.totalPlans}</div>
            <div className="text-xs font-medium c-dim">Total Plans</div>
          </div>
        </div>
        <div className="sc-members reveal">
          <div className="sc-members-chip">
            <Users className="w-[18px] h-[18px] c-gold shrink-0" aria-hidden="true" />
          </div>
          <div>
            <div className="text-xl font-black c-text">{PLAN_KPIS.subscribers}</div>
            <div className="text-xs font-medium c-dim">Active Subscribers</div>
          </div>
        </div>
        <div className="sc-members reveal">
          <div className="sc-members-chip">
            <DollarSign className="w-[18px] h-[18px] c-gold shrink-0" aria-hidden="true" />
          </div>
          <div>
            <div className="text-xl font-black c-text">{PLAN_KPIS.monthlyRecurring}</div>
            <div className="text-xs font-medium c-dim">Monthly Recurring</div>
          </div>
        </div>
        <div className="sc-members reveal">
          <div className="sc-members-chip">
            <TrendingUp className="w-[18px] h-[18px] c-gold shrink-0" aria-hidden="true" />
          </div>
          <div>
            <div className="text-xl font-black c-text">{PLAN_KPIS.mostPopular}</div>
            <div className="text-xs font-medium c-dim">Most Popular</div>
          </div>
        </div>
      </div>

      {/* Featured Plan Cards */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold c-text sec-title">Featured Plans</h3>
        <div className="flex gap-1 p-1 rounded-xl seg-wrap">
          <button
            type="button"
            className={`${cardView === "grid" ? "btn-gold" : "btn-ghost"} flex items-center gap-1.5 px-3 py-1.5 text-xs`}
            onClick={() => setCardView("grid")}
          >
            <LayoutGrid className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            Grid
          </button>
          <button
            type="button"
            className={`${cardView === "list" ? "btn-gold" : "btn-ghost"} flex items-center gap-1.5 px-3 py-1.5 text-xs`}
            onClick={() => setCardView("list")}
          >
            <List className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            List
          </button>
        </div>
      </div>
      <div
        className={
          cardView === "grid"
            ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6"
            : "grid grid-cols-1 md:grid-cols-2 gap-4 mb-6"
        }
      >
        {featured.map((plan) => (
          <div key={plan.id} className="glass-card hover-lift overflow-hidden">
            <div className="h-1.5 gold-bar" />
            <div className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="w-11 h-11 rounded-2xl emoji-tile text-xl">{plan.emoji}</div>
                <span
                  className={`${PLAN_STATUS_BADGE[plan.status]} text-[10px] font-bold px-2 py-0.5 rounded-full`}
                >
                  {plan.status}
                </span>
              </div>
              <div className="text-sm font-black c-text">{plan.name}</div>
              <div className="text-[11px] mb-2 c-dim">{plan.cat}</div>
              <div className="flex items-end gap-1">
                <span className="text-xl font-black gt">{moneyWhole(plan.price)}</span>
                <span className="text-[11px] mb-0.5 c-dim">/ {plan.dur}</span>
              </div>
              <div className="flex items-center gap-1.5 mt-2 text-[11px] c-muted">
                <Users className="w-3 h-3 c-gold shrink-0" aria-hidden="true" />
                {plan.members} members
              </div>
              <div className="flex gap-1.5 mt-3 pt-3 bd-t">
                <button
                  type="button"
                  className="btn-ghost flex-1 py-1.5 text-[11px] flex items-center justify-center gap-1"
                  onClick={() => setView(plan)}
                >
                  <Eye className="w-3 h-3 shrink-0" aria-hidden="true" />
                  View
                </button>
                <button
                  type="button"
                  className="btn-ghost flex-1 py-1.5 text-[11px] flex items-center justify-center gap-1"
                  onClick={() => openEdit(plan)}
                >
                  <Edit2 className="w-3 h-3 shrink-0" aria-hidden="true" />
                  Edit
                </button>
                <RowMenu
                  triggerClassName="btn-ghost py-1.5 px-2.5 text-[11px]"
                  triggerTitle="More"
                  trigger={<MoreHorizontal className="w-3 h-3 shrink-0" aria-hidden="true" />}
                >
                  {menuItemsFor(plan)}
                </RowMenu>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar: search + filters */}
      <div className="glass-card p-4 mb-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search
            className="search-icon absolute left-3 top-1/2 -translate-y-1/2 w-[14px] h-[14px] shrink-0"
            aria-hidden="true"
          />
          <input
            type="text"
            className="fp-input pl-9 py-2 text-sm"
            placeholder="Search plans by name or category…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <CommonSelect
          className="w-auto"
          fieldClassName="py-2 text-sm"
          ariaLabel="Filter by category"
          options={CATEGORY_FILTER_OPTIONS}
          value={cat}
          onChange={(option) => setCat((option?.value as CategoryFilter) ?? "All")}
        />
        <CommonSelect
          className="w-auto"
          fieldClassName="py-2 text-sm"
          ariaLabel="Filter by status"
          options={STATUS_FILTER_OPTIONS}
          value={status}
          onChange={(option) => setStatus((option?.value as PlanStatusFilter) ?? "All")}
        />
        <CommonSelect
          className="w-auto"
          fieldClassName="py-2 text-sm"
          ariaLabel="Sort plans"
          options={SORT_OPTIONS}
          value={sort}
          onChange={(option) => setSort((option?.value as PlanSort) ?? "pop")}
        />
        <button
          type="button"
          className="btn-ghost flex items-center gap-2 px-3 py-2 text-sm"
          onClick={() => showToast("Plans exported")}
        >
          <Download className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
          Export
        </button>
      </div>

      {/* Plans Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full data-table min-w-[920px]">
            <thead>
              <tr>
                <th className="text-left">Plan</th>
                <th className="text-left">Category</th>
                <th className="text-left">Price</th>
                <th className="text-left">Duration</th>
                <th className="text-left">Features</th>
                <th className="text-left">Members</th>
                <th className="text-left">Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((plan) => (
                <tr key={plan.id}>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg emoji-tile text-base">{plan.emoji}</div>
                      <span className="text-sm font-semibold c-text">{plan.name}</span>
                    </div>
                  </td>
                  <td className="text-xs c-muted">{plan.cat}</td>
                  <td className="text-sm font-bold">
                    <span className="gt">{moneyWhole(plan.price)}</span>
                  </td>
                  <td className="text-xs c-dim">{plan.dur}</td>
                  <td>
                    <div className="flex flex-wrap gap-1 max-w-[220px]">
                      {plan.feat.slice(0, 2).map((feature) => (
                        <span
                          key={feature}
                          className="text-[10px] px-2 py-0.5 rounded-full feat-pill"
                        >
                          {feature}
                        </span>
                      ))}
                      {plan.feat.length > 2 && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full feat-more">
                          +{plan.feat.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className="text-sm font-bold c-text">{plan.members}</span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className={`${PLAN_STATUS_BADGE[plan.status]} text-[10px] font-bold px-2.5 py-0.5 rounded-full`}
                      title="Toggle status"
                      onClick={() => toggle(plan)}
                    >
                      {plan.status}
                    </button>
                  </td>
                  <td>
                    <div className="flex gap-1 justify-end">
                      <button
                        type="button"
                        className="icon-btn view"
                        title="View"
                        onClick={() => setView(plan)}
                      >
                        <Eye className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        className="icon-btn"
                        title="Edit"
                        onClick={() => openEdit(plan)}
                      >
                        <Edit2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                      </button>
                      <RowMenu
                        triggerTitle="More"
                        trigger={
                          <MoreVertical className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                        }
                      >
                        {menuItemsFor(plan)}
                      </RowMenu>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {visible.length === 0 && (
          <div className="text-center py-16">
            <div className="text-[42px] opacity-30 mb-2">⭐</div>
            <div className="text-sm font-bold c-text">No plans found</div>
            <div className="text-xs mt-1 c-dim">Try a different search or filter</div>
          </div>
        )}
        <div className="flex items-center justify-between px-4 py-3 bd-t">
          <span className="text-xs c-dim2">
            Showing <span>{visible.length}</span> of <span>{plans.length}</span> plans
          </span>
          {/* Static in the template too — kept for visual parity. */}
          <div className="flex gap-1">
            <button type="button" className="page-btn">
              Prev
            </button>
            <button type="button" className="page-btn active">
              1
            </button>
            <button type="button" className="page-btn">
              2
            </button>
            <button type="button" className="page-btn">
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Keyed so switching between add and edit reseeds the fields. */}
      <PlanFormModal
        key={editing?.id ?? "add"}
        open={formOpen}
        plan={editing}
        onClose={() => setFormOpen(false)}
        onSave={(input) => {
          savePlan(input);
          showToast(`${input.name} ${input.id != null ? "updated" : "added"}`);
        }}
        onInvalid={() => showToast("Enter a plan name")}
      />
      <ViewPlanModal
        plan={view}
        onClose={() => setView(null)}
        onAssign={(plan) => {
          setView(null);
          setAssignTarget(plan);
        }}
        onRenew={(plan) => setRenewTarget(plan)}
        onDuplicate={duplicate}
        onEdit={openEdit}
      />
      <DeletePlanModal
        plan={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={(plan) => {
          removePlan(plan.id);
          setDeleteTarget(null);
          setView(null);
          showToast(`${plan.name} deleted`);
        }}
      />
      <AssignPlanModal
        key={assignTarget?.id ?? "assign"}
        plan={assignTarget}
        onClose={() => setAssignTarget(null)}
        onAssign={(plan, member) => {
          enrol(plan.id);
          setAssignTarget(null);
          showToast(`${member} enrolled in ${plan.name} ✓`);
        }}
      />
      <RenewPlanModal
        key={renewTarget?.id ?? "renew"}
        plan={renewTarget}
        onClose={() => setRenewTarget(null)}
        onRenew={(plan, member) => {
          setRenewTarget(null);
          showToast(`${member}’s ${plan.name} renewed ✓`);
        }}
      />
      <Toast message={message} visible={toastVisible} />
    </>
  );
};

export default MembershipPlans;

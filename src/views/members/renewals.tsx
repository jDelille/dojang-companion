import { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  BellRing,
  CalendarClock,
  CheckCircle2,
  Clock,
  DollarSign,
  Download,
  Edit2,
  Eye,
  FileText,
  MoreVertical,
  PhoneCall,
  Plus,
  RefreshCw,
  Search,
  Send,
  Trash2,
  TrendingUp,
  UserX,
} from "lucide-react";
import RowMenu from "../../components/common/rowMenu";
import Toast from "../../components/common/Toast";
import CommonSelect from "../../components/common-select/commonSelect";
import useToast from "../../hooks/useToast";
import { all_routes } from "../../routes/all_routes";
import type { RenewalMember } from "../../types/renewals";
import { BUCKET_BADGE, PERIOD_OPTIONS } from "../../utils/json/renewalsData";
import { initials, moneyWhole } from "../../utils/formatUtils";
import leadAvatar from "./leadAvatar";
import DaysPill from "./daysPill";
import STAGE_ICON from "./stageIcon";
import useRenewals, {
  bucketOf,
  shortMoney,
  stageMetaOf,
  RENEWAL_TABS,
  type PeriodFilter,
  type RenewalTab,
} from "./useRenewals";
import FollowUpModal from "./modal/followUpModal";
import RenewMembershipModal from "./modal/renewMembershipModal";
import RenewalViewModal from "./modal/renewalViewModal";
import RenewalCampaignModal from "./modal/renewalCampaignModal";
import RenewalEditModal from "./modal/renewalEditModal";
import RenewalPaymentModal from "./modal/renewalPaymentModal";
import RenewalInvoiceModal from "./modal/renewalInvoiceModal";
import RenewalReminderModal from "./modal/renewalReminderModal";
import RenewalDeleteModal from "./modal/renewalDeleteModal";

/*
   Renewals — ported from tailwind/src/renewals.html + assets/js/renewals.js.

   The template kept one <div id="ren-menu"> on <body>; here each row uses the
   shared <RowMenu>, which portals its panel for the same reason.
*/

const toOptions = (values: readonly string[]) =>
  values.map((value) => ({ value, label: value }));

const PERIOD_FILTER_OPTIONS = [
  { value: "All", label: "All Plans" },
  ...toOptions(PERIOD_OPTIONS),
];

const TAB_ICON: Record<RenewalTab, typeof Clock | null> = {
  All: null,
  "Due Soon": Clock,
  Overdue: AlertTriangle,
  Lapsed: UserX,
  Renewed: CheckCircle2,
};

const Renewals = () => {
  const {
    members,
    visible,
    visiblePipeline,
    funnel,
    kpis,
    counts,
    tab,
    setTab,
    period,
    setPeriod,
    search,
    setSearch,
    setStage,
    markRenewed,
    removeMember,
    remindAll,
    saveMember,
    audienceCount,
  } = useRenewals();
  const { message, visible: toastVisible, showToast } = useToast();

  const [follow, setFollow] = useState<RenewalMember | null>(null);
  const [renew, setRenew] = useState<RenewalMember | null>(null);
  const [view, setView] = useState<RenewalMember | null>(null);
  const [payment, setPayment] = useState<RenewalMember | null>(null);
  const [invoice, setInvoice] = useState<RenewalMember | null>(null);
  const [reminder, setReminder] = useState<RenewalMember | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<RenewalMember | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<RenewalMember | null>(null);
  const [campaignOpen, setCampaignOpen] = useState(false);

  const openEdit = (member: RenewalMember | null) => {
    setEditing(member);
    setEditOpen(true);
  };

  /* Keeps the follow-up modal on screen showing the new stage. */
  const advance = (member: RenewalMember, stage: RenewalMember["stage"], text: string) => {
    setStage(member.id, stage);
    setFollow({ ...member, stage, last: "Just now" });
    showToast(text);
  };

  const menuItemsFor = (member: RenewalMember) => (
    <>
      <button type="button" className="dropdown-item" onClick={() => setView(member)}>
        <Eye className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        View Details
      </button>
      <button type="button" className="dropdown-item" onClick={() => setRenew(member)}>
        <RefreshCw className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        Renew Membership
      </button>
      <button type="button" className="dropdown-item" onClick={() => setPayment(member)}>
        <DollarSign className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        Record Payment
      </button>
      <button type="button" className="dropdown-item" onClick={() => setInvoice(member)}>
        <FileText className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        Invoice
      </button>
      <button type="button" className="dropdown-item" onClick={() => setReminder(member)}>
        <BellRing className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        Send Reminder
      </button>
      <div className="menu-sep" />
      <button type="button" className="dropdown-item" onClick={() => openEdit(member)}>
        <Edit2 className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        Edit
      </button>
      <button
        type="button"
        className="dropdown-item danger"
        onClick={() => setDeleteTarget(member)}
      >
        <Trash2 className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        Remove
      </button>
    </>
  );

  return (
    <>
      {/* Page header */}
      <div className="flex md:items-center justify-between flex-wrap xl:flex-nowrap gap-4 mb-5">
        <div>
          <h2 className="text-xl font-black c-text">Renewals</h2>
          <p className="text-sm mt-0.5 c-dim">
            Track expiring &amp; lapsed memberships · Win them back · Austin HQ
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="btn-ghost flex items-center gap-2 px-3.5 py-2 text-sm"
            onClick={() => showToast(`Reminder sent to ${remindAll()} members`)}
          >
            <BellRing className="w-[14px] h-[14px] shrink-0" aria-hidden="true" />
            Remind All
          </button>
          <button
            type="button"
            className="btn-ghost flex items-center gap-2 px-3.5 py-2 text-sm"
            onClick={() => showToast("Renewals exported")}
          >
            <Download className="w-[14px] h-[14px] shrink-0" aria-hidden="true" />
            Export
          </button>
          <button
            type="button"
            className="btn-ghost flex items-center gap-2 px-3.5 py-2 text-sm"
            onClick={() => setCampaignOpen(true)}
          >
            <Send className="w-[14px] h-[14px] shrink-0" aria-hidden="true" />
            Campaign
          </button>
          <button
            type="button"
            className="btn-gold flex items-center gap-2 px-4 py-2.5 text-sm"
            onClick={() => openEdit(null)}
          >
            <Plus className="w-[14px] h-[14px] shrink-0" aria-hidden="true" />
            Add Renewal
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="sc-members reveal">
          <div className="sc-members-chip">
            <CalendarClock className="w-[18px] h-[18px] c-gold shrink-0" aria-hidden="true" />
          </div>
          <div>
            <div className="text-2xl font-black c-text leading-none">{kpis.soon}</div>
            <div className="text-xs font-medium mt-1 c-dim">Expiring (30 days)</div>
          </div>
        </div>
        <div className="sc-members reveal">
          <div className="sc-members-chip">
            <UserX className="w-[18px] h-[18px] c-gold shrink-0" aria-hidden="true" />
          </div>
          <div>
            <div className="text-2xl font-black c-text leading-none">{kpis.lapsed}</div>
            <div className="text-xs font-medium mt-1 c-dim">Lapsed</div>
          </div>
        </div>
        <div className="sc-members reveal">
          <div className="sc-members-chip">
            <DollarSign className="w-[18px] h-[18px] c-gold shrink-0" aria-hidden="true" />
          </div>
          <div>
            <div className="text-2xl font-black c-text leading-none">
              {shortMoney(kpis.value)}
            </div>
            <div className="text-xs font-medium mt-1 c-dim">Renewal Value</div>
          </div>
        </div>
        <div className="sc-members reveal">
          <div className="sc-members-chip">
            <TrendingUp className="w-[18px] h-[18px] c-gold shrink-0" aria-hidden="true" />
          </div>
          <div>
            <div className="text-2xl font-black c-text leading-none">{kpis.rate}%</div>
            <div className="text-xs font-medium mt-1 c-dim">Renewal Rate</div>
          </div>
        </div>
      </div>

      {/* Follow-up funnel */}
      <div className="glass-card p-5 mb-6">
        <h3 className="font-bold c-text sec-title mb-4">Follow-up Pipeline</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {funnel.map(({ stage, count, value }) => {
            const Icon = STAGE_ICON[stage.key];
            return (
              <div
                key={stage.key}
                className="funnel-seg"
                style={{ background: `${stage.color}14`, border: `1px solid ${stage.color}33` }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="contact-dot" style={{ background: `${stage.color}22` }}>
                    <Icon
                      style={{ width: "13px", height: "13px", color: stage.color }}
                      aria-hidden="true"
                    />
                  </div>
                  <span className="text-[12px] font-bold c-text">{stage.key}</span>
                </div>
                <div className="text-2xl font-black c-text leading-none">{count}</div>
                <div className="text-[11px] c-dim mt-0.5">{shortMoney(value)} pipeline</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {RENEWAL_TABS.map((name) => {
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
        <div className="flex items-center gap-2">
          <CommonSelect
            className="w-auto"
            fieldClassName="py-2 text-sm"
            ariaLabel="Filter by plan"
            options={PERIOD_FILTER_OPTIONS}
            value={period}
            onChange={(option) => setPeriod((option?.value as PeriodFilter) ?? "All")}
          />
          <div className="relative min-w-[170px]">
            <Search
              className="search-icon absolute left-3 top-1/2 -translate-y-1/2 w-[14px] h-[14px] shrink-0"
              aria-hidden="true"
            />
            <input
              type="text"
              className="fp-input pl-9 py-2 text-sm"
              placeholder="Search member…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table table-sticky min-w-[940px]">
            <thead>
              <tr>
                <th>Member</th>
                <th>Plan</th>
                <th>Expiry</th>
                <th>Status</th>
                <th>Value</th>
                <th>Last Contact</th>
                <th>Stage</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((member) => {
                const bucket = bucketOf(member);
                const meta = stageMetaOf(member.stage);
                return (
                  <tr key={member.id}>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <div className={`ren-avatar av ${leadAvatar(member.id)}`}>
                          {initials(member.name)}
                        </div>
                        <Link
                          href={`${all_routes.memberProfile}?id=${encodeURIComponent(String(member.id))}`}
                          className="font-semibold c-text hover:text-white"
                        >
                          {member.name}
                        </Link>
                      </div>
                    </td>
                    <td>{member.plan}</td>
                    <td>
                      <DaysPill member={member} />
                    </td>
                    <td>
                      <span className={`badge ${BUCKET_BADGE[bucket]}`}>
                        <span className="dot" />
                        {bucket}
                      </span>
                    </td>
                    <td className="font-bold c-text">{moneyWhole(member.value)}</td>
                    <td className="text-[12px] c-dim">{member.last}</td>
                    <td>
                      <span
                        className="flex items-center gap-1.5 text-[12px]"
                        style={{ color: meta.color }}
                      >
                        <span className="dot" style={{ background: meta.color }} />
                        {member.stage}
                      </span>
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          className="icon-btn"
                          title="Follow up"
                          onClick={() => setFollow(member)}
                        >
                          <PhoneCall className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
                        </button>
                        {member.stage !== "Renewed" && (
                          <button
                            type="button"
                            className="icon-btn"
                            title="Renew now"
                            style={{ color: "#4ADE80" }}
                            onClick={() => setRenew(member)}
                          >
                            <RefreshCw
                              className="w-[15px] h-[15px] shrink-0"
                              aria-hidden="true"
                            />
                          </button>
                        )}
                        <RowMenu
                          triggerTitle="More"
                          trigger={
                            <MoreVertical
                              className="w-[15px] h-[15px] shrink-0"
                              aria-hidden="true"
                            />
                          }
                        >
                          {menuItemsFor(member)}
                        </RowMenu>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {visible.length === 0 && (
          <div className="text-center py-16">
            <div className="text-[42px] opacity-30 mb-2">🔄</div>
            <div className="text-sm font-bold c-text">Nothing here</div>
            <div className="text-xs mt-1 c-dim">Try a different tab, plan, or search</div>
          </div>
        )}
        <div className="flex items-center justify-between px-4 py-3 bd-t">
          <span className="text-xs c-dim2">
            Showing <span>{visible.length}</span> of <span>{members.length}</span> members
          </span>
          <span className="text-xs c-dim2">
            Pipeline value:{" "}
            <span className="c-gold font-bold">{moneyWhole(visiblePipeline)}</span>
          </span>
        </div>
      </div>

      <FollowUpModal
        member={follow}
        onClose={() => setFollow(null)}
        onStage={(member, stage) => advance(member, stage, `Stage: ${stage}`)}
        onCall={(member) => advance(member, "Called", `Calling ${member.name}…`)}
        onMessage={(member) => advance(member, "Reminded", `SMS sent to ${member.name}`)}
        onRenew={(member) => {
          setFollow(null);
          setRenew(member);
        }}
      />
      <RenewMembershipModal
        key={renew?.id ?? "renew"}
        member={renew}
        onClose={() => setRenew(null)}
        onConfirm={(member) => {
          markRenewed(member.id);
          setRenew(null);
          setView(null);
          showToast(`${member.name} renewed! 🎉`);
        }}
      />
      <RenewalViewModal
        member={view}
        onClose={() => setView(null)}
        onRemind={(member) => {
          setView(null);
          setReminder(member);
        }}
        onRenew={(member) => {
          setView(null);
          setRenew(member);
        }}
      />
      <RenewalCampaignModal
        open={campaignOpen}
        onClose={() => setCampaignOpen(false)}
        countFor={audienceCount}
        onSend={(count, channel) => {
          setCampaignOpen(false);
          showToast(`Campaign sent to ${count} members via ${channel}`);
        }}
      />
      {/* Keyed so switching between add and edit reseeds the fields. */}
      <RenewalEditModal
        key={editing?.id ?? "add"}
        open={editOpen}
        member={editing}
        onClose={() => setEditOpen(false)}
        onSave={(input) => {
          saveMember(input);
          showToast(input.id != null ? "Renewal updated" : "Renewal added");
        }}
        onInvalid={() => showToast("Enter a member name")}
      />
      <RenewalPaymentModal
        key={payment?.id ?? "payment"}
        member={payment}
        onClose={() => setPayment(null)}
        onSave={(member, amount, method) => {
          markRenewed(member.id);
          setPayment(null);
          showToast(`Payment of ${moneyWhole(amount)} recorded via ${method}`);
        }}
      />
      <RenewalInvoiceModal
        member={invoice}
        onClose={() => setInvoice(null)}
        onSend={() => {
          setInvoice(null);
          showToast("Invoice sent");
        }}
      />
      <RenewalReminderModal
        key={reminder?.id ?? "reminder"}
        member={reminder}
        onClose={() => setReminder(null)}
        onSend={(member, channel) => {
          // Only a never-contacted member advances a stage.
          if (member.stage === "Not Contacted") setStage(member.id, "Reminded");
          setReminder(null);
          showToast(`Reminder sent to ${member.name} via ${channel}`);
        }}
      />
      <RenewalDeleteModal
        member={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={(member) => {
          removeMember(member.id);
          setDeleteTarget(null);
          showToast(`${member.name} removed`);
        }}
      />
      <Toast message={message} visible={toastVisible} />
    </>
  );
};

export default Renewals;

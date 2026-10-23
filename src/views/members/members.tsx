import { useState } from "react";
import Link from "next/link";
import {
  DollarSign,
  Download,
  Edit2,
  Eye,
  ExternalLink,
  MoreVertical,
  Play,
  RefreshCw,
  ScanLine,
  Search,
  Snowflake,
  Trash2,
  Upload,
  UserPlus,
} from "lucide-react";
import RowMenu from "../../components/common/rowMenu";
import Toast from "../../components/common/Toast";
import CommonSelect from "../../components/common-select/commonSelect";
import useToast from "../../hooks/useToast";
import { all_routes } from "../../routes/all_routes";
import type { Member } from "../../types/members";
import {
  MEMBER_STATUS_BADGE,
  PLAN_CLASS,
  PLAN_OPTIONS,
  PLAN_PRICE,
  PLAN_UNIT,
  TOTAL_MEMBERS,
} from "../../utils/json/membersData";
import { moneyWhole, number } from "../../utils/formatUtils";
import useMembers, { type PlanFilter, type StatusFilter } from "./useMembers";
import AddMemberModal from "./modal/addMemberModal";
import EditMemberModal from "./modal/editMemberModal";
import ViewMemberModal from "./modal/viewMemberModal";
import CheckinMemberModal from "./modal/checkinMemberModal";
import RenewMemberModal from "./modal/renewMemberModal";
import FreezeMemberModal from "./modal/freezeMemberModal";
import PaymentMemberModal from "./modal/paymentMemberModal";
import ImportMembersModal from "./modal/importMembersModal";
import ExportMembersModal from "./modal/exportMembersModal";
import DeleteMemberModal from "./modal/deleteMemberModal";

/*
   Members — ported from tailwind/src/members.html + assets/js/members.js.

   The template kept one <div id="row-menu"> on <body> and positioned it by
   hand; here each row renders a <RowMenu>, which portals the panel to <body>
   for the same reason — an absolutely-positioned menu is clipped by the
   table's scroll wrapper and painted over by the row.
*/

const toOptions = (values: readonly string[]) =>
  values.map((value) => ({ value, label: value }));

const PLAN_FILTER_OPTIONS = toOptions(["All Plans", ...PLAN_OPTIONS]);
const STATUS_FILTER_OPTIONS = toOptions([
  "All Status",
  "Active",
  "Expiring",
  "Expired",
]);

/** Four placeholder rows, matching skeletonHtml() in the template. */
const SkeletonRows = () => (
  <>
    {Array.from({ length: 4 }).map((_, row) => (
      <tr key={row}>
        <td>
          <div className="skel w-12" />
        </td>
        <td>
          <div className="flex items-center gap-3">
            <div className="skel w-8 h-8 rounded-xl" />
            <div className="flex-1">
              <div className="skel w-28 mb-1" />
              <div className="skel w-20" />
            </div>
          </div>
        </td>
        <td>
          <div className="skel w-24" />
        </td>
        <td>
          <div className="skel w-20" />
        </td>
        <td>
          <div className="skel w-12" />
        </td>
        <td>
          <div className="skel w-20" />
        </td>
        <td>
          <div className="skel w-16 rounded-full" />
        </td>
        <td>
          <div className="skel w-14" />
        </td>
      </tr>
    ))}
  </>
);

const Members = () => {
  const {
    visible,
    loading,
    search,
    setSearch,
    plan,
    setPlan,
    status,
    setStatus,
    refresh,
    addMember,
    updateMember,
    checkIn,
    renew,
    setStatusOf,
    removeMember,
  } = useMembers();
  const { message, visible: toastVisible, showToast } = useToast();

  const [addOpen, setAddOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [view, setView] = useState<Member | null>(null);
  const [edit, setEdit] = useState<Member | null>(null);
  const [checkinTarget, setCheckinTarget] = useState<Member | null>(null);
  const [renewTarget, setRenewTarget] = useState<Member | null>(null);
  const [freezeTarget, setFreezeTarget] = useState<Member | null>(null);
  const [paymentTarget, setPaymentTarget] = useState<Member | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Member | null>(null);

  /* Unfreezing has no confirmation step — it acts and toasts immediately. */
  const unfreeze = (member: Member) => {
    setStatusOf(member.id, "Active");
    setView(null);
    showToast(`${member.first}’s membership reactivated`);
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-black c-text">Members</h2>
          <p className="text-sm mt-0.5 c-dim">{number(TOTAL_MEMBERS)} total active members</p>
        </div>
        <button
          type="button"
          className="btn-gold flex items-center gap-2 px-4 py-2.5 text-sm"
          onClick={() => setAddOpen(true)}
        >
          <UserPlus className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          Add Member
        </button>
      </div>

      <div className="glass-card p-4 mb-5 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 c-dim2 shrink-0"
            aria-hidden="true"
          />
          <input
            type="text"
            className="fp-input pl-9 py-2 text-sm"
            placeholder="Search by name, phone, ID…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <CommonSelect
          className="w-auto"
          fieldClassName="py-2 text-sm"
          ariaLabel="Filter by plan"
          options={PLAN_FILTER_OPTIONS}
          value={plan}
          onChange={(option) => setPlan((option?.value as PlanFilter) ?? "All Plans")}
        />
        <CommonSelect
          className="w-auto"
          fieldClassName="py-2 text-sm"
          ariaLabel="Filter by status"
          options={STATUS_FILTER_OPTIONS}
          value={status}
          onChange={(option) => setStatus((option?.value as StatusFilter) ?? "All Status")}
        />
        <button
          type="button"
          className="btn-ghost flex items-center gap-2 px-3 py-2 text-sm"
          onClick={refresh}
        >
          <RefreshCw className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
          Refresh
        </button>
        <button
          type="button"
          className="btn-ghost flex items-center gap-2 px-3 py-2 text-sm"
          onClick={() => setImportOpen(true)}
        >
          <Upload className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
          Import
        </button>
        <button
          type="button"
          className="btn-ghost flex items-center gap-2 px-3 py-2 text-sm"
          onClick={() => setExportOpen(true)}
        >
          <Download className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
          Export
        </button>
      </div>

      <div className="glass-card overflow-hidden">
        {/* 8 columns cannot fit a phone, so the table scrolls inside the card. */}
        <div className="overflow-x-auto">
          <table className="w-full data-table min-w-[900px]">
            <thead>
              <tr>
                <th className="text-left">#</th>
                <th className="text-left">Member</th>
                <th className="text-left">Plan</th>
                <th className="text-left">Trainer</th>
                <th className="text-left">Check-ins</th>
                <th className="text-left">Expires</th>
                <th className="text-left">Status</th>
                <th className="text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <SkeletonRows />
              ) : (
                visible.map((member) => {
                  const frozen = member.status === "Frozen";
                  return (
                    <tr key={member.id} className="fade-up">
                      <td className="text-xs c-dim2">{member.id}</td>
                      <td>
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${member.av}`}
                          >
                            {member.ini}
                          </div>
                          <div>
                            <div className="font-semibold text-white text-sm">
                              {member.first} {member.last}
                            </div>
                            <div className="text-[11px] c-dim">{member.phone}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span
                          className={`text-xs font-semibold ${PLAN_CLASS[member.planLabel] ?? "c-dim"}`}
                        >
                          {member.planLabel}
                        </span>
                      </td>
                      <td className="text-xs c-dim">{member.trainer}</td>
                      <td>
                        <span className="text-sm font-bold text-white">{member.checkins}</span>
                        <span className="text-[11px] ml-1 c-dim2">
                          {PLAN_UNIT[member.planLabel] ?? "/ mo"}
                        </span>
                      </td>
                      <td className="text-xs c-dim">{member.expiresDisp}</td>
                      <td>
                        <span
                          className={`${MEMBER_STATUS_BADGE[member.status] ?? "badge-inactive"} text-[10px] font-bold px-2.5 py-0.5 rounded-full`}
                        >
                          {member.status}
                        </span>
                      </td>
                      <td>
                        <div className="flex gap-1 items-center">
                          <button
                            type="button"
                            className="icon-btn view"
                            title="View"
                            onClick={() => setView(member)}
                          >
                            <Eye className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            className="icon-btn"
                            title="Edit"
                            onClick={() => setEdit(member)}
                          >
                            <Edit2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                          </button>
                          <RowMenu
                            triggerTitle="More"
                            trigger={
                              <MoreVertical
                                className="w-3.5 h-3.5 shrink-0"
                                aria-hidden="true"
                              />
                            }
                          >
                              <button
                                type="button"
                                className="dropdown-item"
                                onClick={() => setView(member)}
                              >
                                <Eye className="w-4 h-4 shrink-0" aria-hidden="true" />
                                View Details
                              </button>
                              <Link
                                className="dropdown-item"
                                href={`${all_routes.memberProfile}?id=${encodeURIComponent(member.id)}`}
                              >
                                <ExternalLink
                                  className="w-4 h-4 shrink-0"
                                  aria-hidden="true"
                                />
                                View Profile
                              </Link>
                              <button
                                type="button"
                                className="dropdown-item"
                                onClick={() => setCheckinTarget(member)}
                              >
                                <ScanLine className="w-4 h-4 shrink-0" aria-hidden="true" />
                                Check-in
                              </button>
                              <button
                                type="button"
                                className="dropdown-item"
                                onClick={() => setRenewTarget(member)}
                              >
                                <RefreshCw className="w-4 h-4 shrink-0" aria-hidden="true" />
                                Renew Membership
                              </button>
                              <button
                                type="button"
                                className="dropdown-item"
                                onClick={() =>
                                  frozen ? unfreeze(member) : setFreezeTarget(member)
                                }
                              >
                                {frozen ? (
                                  <Play className="w-4 h-4 shrink-0" aria-hidden="true" />
                                ) : (
                                  <Snowflake className="w-4 h-4 shrink-0" aria-hidden="true" />
                                )}
                                {frozen ? "Unfreeze" : "Freeze"}
                              </button>
                              <button
                                type="button"
                                className="dropdown-item"
                                onClick={() => setPaymentTarget(member)}
                              >
                                <DollarSign className="w-4 h-4 shrink-0" aria-hidden="true" />
                                Take Payment
                              </button>
                              <button
                                type="button"
                                className="dropdown-item danger"
                                onClick={() => setDeleteTarget(member)}
                              >
                                <Trash2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                                Delete
                              </button>
                          </RowMenu>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {!loading && visible.length === 0 && (
          <div className="text-center py-16">
            <div className="text-[42px] opacity-30 mb-2">👤</div>
            <div className="text-sm font-bold c-text">No members found</div>
            <div className="text-xs mt-1 c-dim">
              Try a different search, plan, or status filter
            </div>
          </div>
        )}
        <div className="flex items-center justify-between px-4 py-3 bd-t">
          <span className="text-xs c-dim2">
            Showing <span>{visible.length}</span> of {number(TOTAL_MEMBERS)}
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

      <AddMemberModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onAdd={(input) => {
          addMember(input);
          showToast(`${`${input.first} ${input.last}`.trim()} added`);
        }}
      />
      {/* Keyed so a different member remounts the form with its values. */}
      <EditMemberModal
        key={edit?.id ?? "edit"}
        member={edit}
        onClose={() => setEdit(null)}
        onSave={(input) => {
          updateMember(input);
          showToast(`${input.first.trim() || edit?.first} updated`);
        }}
      />
      <ViewMemberModal
        member={view}
        onClose={() => setView(null)}
        onCheckin={(member) => setCheckinTarget(member)}
        onRenew={(member) => setRenewTarget(member)}
        onFreeze={(member) => setFreezeTarget(member)}
        onUnfreeze={unfreeze}
        onPayment={(member) => setPaymentTarget(member)}
        onEdit={(member) => {
          setView(null);
          setEdit(member);
        }}
        onDelete={(member) => {
          setView(null);
          setDeleteTarget(member);
        }}
      />
      <CheckinMemberModal
        member={checkinTarget}
        onClose={() => setCheckinTarget(null)}
        onConfirm={(member) => {
          checkIn(member.id);
          setCheckinTarget(null);
          setView(null);
          showToast(`${member.first} checked in ✓`);
        }}
      />
      <RenewMemberModal
        key={renewTarget?.id ?? "renew"}
        member={renewTarget}
        onClose={() => setRenewTarget(null)}
        onConfirm={(member, nextPlan) => {
          renew(member.id, nextPlan);
          setRenewTarget(null);
          setView(null);
          // Priced on the plan they renewed onto, not the previous one.
          showToast(
            `${member.first}’s membership renewed · ${moneyWhole(PLAN_PRICE[nextPlan] ?? 0)}`,
          );
        }}
      />
      <FreezeMemberModal
        member={freezeTarget}
        onClose={() => setFreezeTarget(null)}
        onConfirm={(member) => {
          setStatusOf(member.id, "Frozen");
          setFreezeTarget(null);
          setView(null);
          showToast(`${member.first}’s membership frozen ❄️`);
        }}
      />
      <PaymentMemberModal
        member={paymentTarget}
        onClose={() => setPaymentTarget(null)}
        onConfirm={(_member, amount, method) => {
          setPaymentTarget(null);
          setView(null);
          showToast(`Payment of ${moneyWhole(amount)} recorded (${method})`);
        }}
      />
      <ImportMembersModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImport={(fileName) =>
          showToast(
            fileName ? `Imported ${fileName}` : "No file selected — nothing imported",
          )
        }
        onDownloadTemplate={() => showToast("Sample template downloaded")}
      />
      <ExportMembersModal
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        onExport={(format, scope) => {
          const count = scope === "all" ? TOTAL_MEMBERS : visible.length;
          showToast(`Exported ${count} members as ${format}`);
        }}
      />
      <DeleteMemberModal
        member={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={(member) => {
          removeMember(member.id);
          setDeleteTarget(null);
          showToast(`${member.first} removed`);
        }}
      />
      <Toast message={message} visible={toastVisible} />
    </>
  );
};

export default Members;

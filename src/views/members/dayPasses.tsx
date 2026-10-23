import { useState } from "react";
import {
  CheckCircle2,
  DollarSign,
  Download,
  Dumbbell,
  Edit2,
  Eye,
  FileText,
  LogIn,
  LogOut,
  MoreVertical,
  Printer,
  RefreshCw,
  Search,
  Ticket,
  Trash2,
  UserCheck,
  UserPlus,
} from "lucide-react";
import RowMenu from "../../components/common/rowMenu";
import Toast from "../../components/common/Toast";
import useToast from "../../hooks/useToast";
import type { DayPass } from "../../types/dayPasses";
import { PASS_STATUS_BADGE, PASS_TYPES } from "../../utils/json/dayPassesData";
import { initials, moneyWhole } from "../../utils/formatUtils";
import leadAvatar from "./leadAvatar";
import PASS_TYPE_ICON from "./passTypeIcon";
import QrBox from "./qrBox";
import useDayPasses, { PASS_TABS, type PassTab } from "./useDayPasses";
import IssuePassModal from "./modal/issuePassModal";
import PassDetailsModal from "./modal/passDetailsModal";
import ConvertPassModal from "./modal/convertPassModal";
import EditPassModal from "./modal/editPassModal";
import SellPassModal from "./modal/sellPassModal";
import RenewPassModal from "./modal/renewPassModal";
import PassPaymentModal from "./modal/passPaymentModal";
import PassInvoiceModal from "./modal/passInvoiceModal";
import DeletePassModal from "./modal/deletePassModal";

/*
   Day Passes — ported from tailwind/src/day-passes.html +
   assets/js/day-passes.js.

   "Active" is shown as "Inside" throughout, matching the template's label
   swap in both the table and the details modal.
*/

const TAB_LABEL: Record<PassTab, string> = {
  All: "All",
  Active: "Inside",
  Used: "Used",
  Converted: "Converted",
};

const TAB_ICON: Record<PassTab, typeof LogIn | null> = {
  All: null,
  Active: LogIn,
  Used: CheckCircle2,
  Converted: UserCheck,
};

const DayPasses = () => {
  const {
    passes,
    visible,
    latest,
    kpis,
    counts,
    tab,
    setTab,
    search,
    setSearch,
    issuePass,
    savePass,
    sellPass,
    renewPass,
    convertPass,
    checkOut,
    removePass,
  } = useDayPasses();
  const { message, visible: toastVisible, showToast } = useToast();

  const [issueOpen, setIssueOpen] = useState(false);
  const [detail, setDetail] = useState<DayPass | null>(null);
  const [convertTarget, setConvertTarget] = useState<DayPass | null>(null);
  const [editTarget, setEditTarget] = useState<DayPass | null>(null);
  const [sellTarget, setSellTarget] = useState<DayPass | null>(null);
  const [renewTarget, setRenewTarget] = useState<DayPass | null>(null);
  const [paymentTarget, setPaymentTarget] = useState<DayPass | null>(null);
  const [invoiceTarget, setInvoiceTarget] = useState<DayPass | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DayPass | null>(null);

  const doCheckOut = (pass: DayPass) => {
    checkOut(pass.id);
    setDetail(null);
    showToast(`${pass.name} checked out`);
  };

  const menuItemsFor = (pass: DayPass) => (
    <>
      <button type="button" className="dropdown-item" onClick={() => setDetail(pass)}>
        <Eye className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        View Details
      </button>
      <button type="button" className="dropdown-item" onClick={() => setEditTarget(pass)}>
        <Edit2 className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        Edit
      </button>
      <button type="button" className="dropdown-item" onClick={() => setSellTarget(pass)}>
        <Ticket className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        Sell Pass
      </button>
      <button type="button" className="dropdown-item" onClick={() => setRenewTarget(pass)}>
        <RefreshCw className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        Renew / Extend
      </button>
      <button type="button" className="dropdown-item" onClick={() => setPaymentTarget(pass)}>
        <DollarSign className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        Record Payment
      </button>
      <button type="button" className="dropdown-item" onClick={() => setInvoiceTarget(pass)}>
        <FileText className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        Invoice
      </button>
      <button type="button" className="dropdown-item" onClick={() => setConvertTarget(pass)}>
        <UserPlus className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        Convert to Member
      </button>
      <div className="menu-sep" />
      <button
        type="button"
        className="dropdown-item danger"
        onClick={() => setDeleteTarget(pass)}
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
          <h2 className="text-xl font-black c-text">Day Passes</h2>
          <p className="text-sm mt-0.5 c-dim">
            Guest, trial &amp; visitor pass management · Mon, Jul 14, 2026 · Austin HQ
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="btn-ghost flex items-center gap-2 px-3.5 py-2 text-sm"
            onClick={() => showToast("Passes exported")}
          >
            <Download className="w-[14px] h-[14px] shrink-0" aria-hidden="true" />
            Export
          </button>
          <button
            type="button"
            className="btn-gold flex items-center gap-2 px-4 py-2.5 text-sm"
            onClick={() => setIssueOpen(true)}
          >
            <Ticket className="w-[14px] h-[14px] shrink-0" aria-hidden="true" />
            Issue Pass
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="sc-members reveal">
          <div className="sc-members-chip">
            <Ticket className="w-[18px] h-[18px] c-gold shrink-0" aria-hidden="true" />
          </div>
          <div>
            <div className="text-2xl font-black c-text leading-none">{kpis.today}</div>
            <div className="text-xs font-medium mt-1 c-dim">Passes Today</div>
          </div>
        </div>
        <div className="sc-members reveal">
          <div className="sc-members-chip">
            <LogIn className="w-[18px] h-[18px] c-gold shrink-0" aria-hidden="true" />
          </div>
          <div>
            <div className="text-2xl font-black c-text leading-none">{kpis.inside}</div>
            <div className="text-xs font-medium mt-1 c-dim">Currently Inside</div>
          </div>
        </div>
        <div className="sc-members reveal">
          <div className="sc-members-chip">
            <DollarSign className="w-[18px] h-[18px] c-gold shrink-0" aria-hidden="true" />
          </div>
          <div>
            <div className="text-2xl font-black c-text leading-none">
              {moneyWhole(kpis.revenue)}
            </div>
            <div className="text-xs font-medium mt-1 c-dim">Pass Revenue</div>
          </div>
        </div>
        <div className="sc-members reveal">
          <div className="sc-members-chip">
            <UserPlus className="w-[18px] h-[18px] c-gold shrink-0" aria-hidden="true" />
          </div>
          <div>
            <div className="text-2xl font-black c-text leading-none">{kpis.converted}</div>
            <div className="text-xs font-medium mt-1 c-dim">Converted to Member</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Table */}
        <div className="xl:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {PASS_TABS.map((name) => {
                const Icon = TAB_ICON[name];
                return (
                  <button
                    key={name}
                    type="button"
                    className={name === tab ? "ord-tab active" : "ord-tab"}
                    onClick={() => setTab(name)}
                  >
                    {Icon && <Icon className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />}
                    {TAB_LABEL[name]} <span className="cnt">{counts[name]}</span>
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
                placeholder="Search guest…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="data-table table-sticky min-w-[760px]">
                <thead>
                  <tr>
                    <th>Guest</th>
                    <th>Pass</th>
                    <th>Type</th>
                    <th>Check-In</th>
                    <th>Fee</th>
                    <th>Status</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((pass) => (
                    <tr key={pass.id}>
                      <td>
                        <div className="flex items-center gap-2.5">
                          <div className={`dp-avatar av ${leadAvatar(pass.id)}`}>
                            {initials(pass.name)}
                          </div>
                          <div>
                            <div className="font-semibold c-text">{pass.name}</div>
                            <div className="text-[11px] c-dim">
                              {pass.ref ? `via ${pass.ref}` : pass.phone}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="font-mono text-xs c-gold">{pass.code}</td>
                      <td>{pass.type}</td>
                      <td className="text-[12px] c-dim">{pass.checkin}</td>
                      <td className={pass.fee ? "font-bold c-text" : "font-bold c-green"}>
                        {pass.fee ? moneyWhole(pass.fee) : "Free"}
                      </td>
                      <td>
                        <span className={`badge ${PASS_STATUS_BADGE[pass.status]}`}>
                          <span className="dot" />
                          {pass.status === "Active" ? "Inside" : pass.status}
                        </span>
                      </td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            className="icon-btn"
                            title="Details"
                            onClick={() => setDetail(pass)}
                          >
                            <Eye className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
                          </button>
                          {pass.status === "Active" && (
                            <button
                              type="button"
                              className="icon-btn"
                              title="Check out"
                              onClick={() => doCheckOut(pass)}
                            >
                              <LogOut
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
                            {menuItemsFor(pass)}
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
                <div className="text-[38px] opacity-30 mb-2">🎟️</div>
                <div className="text-sm font-bold c-text">No passes found</div>
                <div className="text-xs mt-1 c-dim">Issue a pass to get started</div>
              </div>
            )}
            <div className="flex items-center justify-between px-4 py-3 bd-t">
              <span className="text-xs c-dim2">
                Showing <span>{visible.length}</span> of <span>{passes.length}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Last issued ticket + types */}
        <div className="space-y-5">
          <div className="ticket">
            <div className="p-5 relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center grad-gold">
                    <Dumbbell className="w-4 h-4 t-ink shrink-0" aria-hidden="true" />
                  </div>
                  <span className="text-[13px] font-black c-text">Dreams GYM</span>
                </div>
                <span className="type-pill type-gold">Day Pass</span>
              </div>
              <div className="flex items-center gap-4">
                <QrBox seed={latest.code} />
                <div>
                  <div className="text-[10px] c-dim2 font-bold uppercase tracking-wider">
                    Latest Guest
                  </div>
                  <div className="text-base font-black c-text">{latest.name}</div>
                  <div className="text-[11px] font-mono c-gold mt-0.5">{latest.code}</div>
                  <div className="text-[11px] c-dim mt-1">
                    {latest.type} · Valid today only
                  </div>
                </div>
              </div>
            </div>
            <div className="ticket-perf" />
            <div className="p-4 relative z-10 flex items-center justify-between">
              <span className="text-[11px] c-dim">Single entry · Full facility access</span>
              <button
                type="button"
                className="text-[11px] font-bold c-gold flex items-center gap-1"
                onClick={() => window.print()}
              >
                <Printer className="w-3 h-3 shrink-0" aria-hidden="true" />
                Print
              </button>
            </div>
          </div>

          <div className="glass-card p-5">
            <h3 className="font-bold c-text sec-title mb-3">Pass Types</h3>
            <div className="space-y-2.5">
              {PASS_TYPES.map((type) => {
                const Icon = PASS_TYPE_ICON[type.name];
                return (
                  <div key={type.name} className="type-row">
                    <div className="icon-box ic-gold ic-32">
                      <Icon className="w-[14px] h-[14px] c-gold shrink-0" aria-hidden="true" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-bold c-text">{type.name}</div>
                      <div className="text-[11px] c-dim">{type.desc}</div>
                    </div>
                    <div
                      className={`text-[13px] font-black ${type.fee ? "c-gold" : "c-green"}`}
                    >
                      {type.fee ? moneyWhole(type.fee) : "Free"}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Keyed so each open reseeds the form. */}
      <IssuePassModal
        key={issueOpen ? "issue-open" : "issue-closed"}
        open={issueOpen}
        onClose={() => setIssueOpen(false)}
        onIssue={(input) => {
          const created = issuePass(input);
          showToast(`Pass issued & checked in — ${created.code}`);
        }}
      />
      <PassDetailsModal
        pass={detail}
        onClose={() => setDetail(null)}
        onCheckOut={doCheckOut}
        onConvert={(pass) => {
          setDetail(null);
          setConvertTarget(pass);
        }}
      />
      <ConvertPassModal
        key={convertTarget?.id ?? "convert"}
        pass={convertTarget}
        onClose={() => setConvertTarget(null)}
        onConvert={(pass) => {
          convertPass(pass.id);
          setConvertTarget(null);
          showToast(`${pass.name} converted to member! 🎉`);
        }}
      />
      <EditPassModal
        key={editTarget?.id ?? "edit"}
        pass={editTarget}
        onClose={() => setEditTarget(null)}
        onSave={(input) => {
          savePass(input);
          setEditTarget(null);
          showToast("Pass updated");
        }}
      />
      <SellPassModal
        key={sellTarget?.id ?? "sell"}
        pass={sellTarget}
        onClose={() => setSellTarget(null)}
        onSell={(pass, type, payment) => {
          sellPass(pass.id, type);
          setSellTarget(null);
          showToast(`Pass sold — ${payment}`);
        }}
      />
      <RenewPassModal
        key={renewTarget?.id ?? "renew"}
        pass={renewTarget}
        onClose={() => setRenewTarget(null)}
        onRenew={(pass) => {
          renewPass(pass.id);
          setRenewTarget(null);
          showToast(`${pass.name} extended`);
        }}
      />
      <PassPaymentModal
        key={paymentTarget?.id ?? "payment"}
        pass={paymentTarget}
        onClose={() => setPaymentTarget(null)}
        onConfirm={(amount, method) => {
          setPaymentTarget(null);
          showToast(`Payment of ${moneyWhole(amount)} recorded via ${method}`);
        }}
      />
      <PassInvoiceModal
        pass={invoiceTarget}
        onClose={() => setInvoiceTarget(null)}
        onSend={() => {
          setInvoiceTarget(null);
          showToast("Invoice sent");
        }}
      />
      <DeletePassModal
        pass={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={(pass) => {
          removePass(pass.id);
          setDeleteTarget(null);
          showToast(`${pass.name} pass deleted`);
        }}
      />
      <Toast message={message} visible={toastVisible} />
    </>
  );
};

export default DayPasses;

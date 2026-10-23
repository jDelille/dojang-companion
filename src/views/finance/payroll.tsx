import { useState } from "react";
import {
  CalendarCheck,
  Check,
  CircleCheckBig,
  Clock,
  DollarSign,
  Download,
  Eye,
  FileText,
  Hourglass,
  MoreVertical,
  Pencil,
  Play,
  Search,
  Trash2,
  UserPlus,
  Users,
  Wallet,
  Zap,
} from "lucide-react";
import type { StaffPay } from "../../types/payroll";
import { DEPTS, PAYROLL_STATUS_BADGE } from "../../utils/json/payrollData";
import { avatarFor, initials, moneyWhole } from "../../utils/formatUtils";
import RowMenu from "../../components/common/rowMenu";
import Toast from "../../components/common/Toast";
import usePayroll, { netOf } from "./usePayroll";
import PayslipModal from "./modal/payslipModal";
import PayrollFormModal from "./modal/payrollFormModal";
import PayrollViewModal from "./modal/payrollViewModal";
import PayrollProcessModal from "./modal/payrollProcessModal";
import PayrollPaymentModal from "./modal/payrollPaymentModal";
import PayrollDeleteModal from "./modal/payrollDeleteModal";

/*
   Payroll — ported from tailwind/src/payroll.html and assets/js/payroll.js.
   Salary table, run-payroll banner, filters and the full modal suite.
*/

const TABS = [
  { tab: "All", label: "All Staff", Icon: null },
  { tab: "Paid", label: "Paid", Icon: CircleCheckBig },
  { tab: "Pending", label: "Pending", Icon: Clock },
];

type ModalKind = "slip" | "form" | "view" | "process" | "payment" | "delete";

const Payroll = () => {
  const page = usePayroll();
  const { staff, filtered, filteredNet, kpis, tab, setTab, dept, setDept, search, setSearch } =
    page;

  const [modal, setModal] = useState<ModalKind | null>(null);
  const [targetId, setTargetId] = useState<number | null>(null);
  const target = targetId != null ? page.find(targetId) : null;

  const open = (kind: ModalKind, id: number | null) => {
    setTargetId(id);
    setModal(kind);
  };
  const close = () => setModal(null);

  /* Per-row menu — Process and Record Payment only show while Pending. */
  const menuFor = (e: StaffPay) => (
    <RowMenu
      triggerClassName="pr-menu-btn"
      triggerTitle="More"
      trigger={<MoreVertical className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />}
    >
      <button type="button" className="dropdown-item" onClick={() => open("view", e.id)}>
        <Eye className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        View Details
      </button>
      <button type="button" className="dropdown-item" onClick={() => open("form", e.id)}>
        <Pencil className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        Edit Payroll
      </button>
      <button type="button" className="dropdown-item" onClick={() => open("slip", e.id)}>
        <FileText className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        Generate Payslip
      </button>
      {e.status === "Pending" && (
        <>
          <button
            type="button"
            className="dropdown-item ok"
            onClick={() => open("process", e.id)}
          >
            <Zap className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
            Process Salary
          </button>
          <button type="button" className="dropdown-item" onClick={() => open("payment", e.id)}>
            <DollarSign className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
            Record Payment
          </button>
        </>
      )}
      <div className="menu-sep" />
      <button type="button" className="dropdown-item danger" onClick={() => open("delete", e.id)}>
        <Trash2 className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        Delete
      </button>
    </RowMenu>
  );

  return (
    <>
      {/* Page header */}
      <div className="flex md:items-center justify-between flex-wrap xl:flex-nowrap gap-4 mb-5">
        <div>
          <h2 className="text-xl font-black c-text">Payroll</h2>
          <p className="text-sm mt-0.5 c-dim">
            Process staff salaries &amp; payslips · July 2026 · Austin HQ
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="btn-ghost flex items-center gap-2 px-3.5 py-2 text-sm"
            onClick={page.exportPayroll}
          >
            <Download className="w-[14px] h-[14px] shrink-0" aria-hidden="true" />
            Export
          </button>
          <button
            type="button"
            className="btn-ghost flex items-center gap-2 px-3.5 py-2 text-sm"
            onClick={() => open("form", null)}
          >
            <UserPlus className="w-[14px] h-[14px] shrink-0" aria-hidden="true" />
            Add Payroll
          </button>
          <button
            type="button"
            className="btn-gold flex items-center gap-2 px-4 py-2.5 text-sm"
            onClick={page.runAll}
          >
            <Play className="w-[14px] h-[14px] shrink-0" aria-hidden="true" />
            Run Payroll
          </button>
        </div>
      </div>

      {/* Run banner */}
      <div className="run-banner p-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="icon-box ic-gold size-px-44">
            <CalendarCheck className="w-[20px] h-[20px] c-gold shrink-0" aria-hidden="true" />
          </div>
          <div>
            <div className="text-sm font-bold c-text">July 2026 Payroll Cycle</div>
            <div className="text-[12px] c-dim">
              Pay date: Jul 31, 2026 ·{" "}
              <span style={{ color: kpis.runColor }}>{kpis.runStatus}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right mr-2">
            <div className="text-[10px] c-dim2 font-bold uppercase tracking-wider">
              Net Payable
            </div>
            <div className="text-lg font-black gt leading-none">{kpis.runNet}</div>
          </div>
          <button
            type="button"
            className="btn-gold px-4 py-2.5 text-sm flex items-center gap-2"
            onClick={page.runAll}
          >
            <Zap className="w-[14px] h-[14px] shrink-0" aria-hidden="true" />
            Process All
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="sc-finance reveal">
          <div className="sc-finance-strip">
            <div className="icon-box ic-gold">
              <Users className="w-[16px] h-[16px] c-gold shrink-0" aria-hidden="true" />
            </div>
            <div className="text-xs font-medium c-dim">Employees</div>
          </div>
          <div className="sc-finance-body">
            <div className="text-2xl font-black c-text leading-none">{kpis.employees}</div>
          </div>
        </div>
        <div className="sc-finance reveal">
          <div className="sc-finance-strip">
            <div className="icon-box ic-cyan">
              <Wallet className="w-[16px] h-[16px] c-cyan shrink-0" aria-hidden="true" />
            </div>
            <div className="text-xs font-medium c-dim">Gross Payroll</div>
          </div>
          <div className="sc-finance-body">
            <div className="text-2xl font-black c-text leading-none">{kpis.gross}</div>
          </div>
        </div>
        <div className="sc-finance reveal">
          <div className="sc-finance-strip">
            <div className="icon-box ic-green">
              <CircleCheckBig className="w-[16px] h-[16px] c-green shrink-0" aria-hidden="true" />
            </div>
            <div className="text-xs font-medium c-dim">Paid</div>
          </div>
          <div className="sc-finance-body">
            <div className="text-2xl font-black c-text leading-none">{kpis.paid}</div>
          </div>
        </div>
        <div className="sc-finance reveal">
          <div className="sc-finance-strip">
            <div className="icon-box ic-orange">
              <Hourglass className="w-[16px] h-[16px] c-orange shrink-0" aria-hidden="true" />
            </div>
            <div className="text-xs font-medium c-dim">Pending</div>
          </div>
          <div className="sc-finance-body">
            <div className="text-2xl font-black c-text leading-none">{kpis.pending}</div>
          </div>
        </div>
      </div>

      {/* Tabs + search */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {TABS.map(({ tab: value, label, Icon }) => (
            <button
              key={value}
              type="button"
              className={tab === value ? "ord-tab active" : "ord-tab"}
              onClick={() => setTab(value)}
            >
              {Icon && <Icon className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />}
              {label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <select
            className="fp-input py-2 text-sm w-auto"
            value={dept}
            onChange={(e) => setDept(e.target.value)}
          >
            <option value="All">All Departments</option>
            {DEPTS.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
          <div className="relative min-w-[170px]">
            <Search
              className="search-icon absolute left-3 top-1/2 -translate-y-1/2 w-[14px] h-[14px] shrink-0"
              aria-hidden="true"
            />
            <input
              type="text"
              className="fp-input pl-9 py-2 text-sm"
              placeholder="Search employee…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Payroll table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table table-sticky min-w-[880px]">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Department</th>
                <th>Basic</th>
                <th>Allowances</th>
                <th>Deductions</th>
                <th>Net Pay</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => (
                <tr key={e.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className={`emp-avatar av ${avatarFor(e.name)}`}>
                        {initials(e.name)}
                      </div>
                      <div>
                        <div className="font-semibold c-text">{e.name}</div>
                        <div className="text-[11px] c-dim">{e.role}</div>
                      </div>
                    </div>
                  </td>
                  <td>{e.dept}</td>
                  <td className="c-text2">{moneyWhole(e.basic)}</td>
                  <td className="c-green">+{moneyWhole(e.allowances + e.incentives)}</td>
                  <td className="c-red">−{moneyWhole(e.deductions)}</td>
                  <td className="font-bold c-text">{moneyWhole(netOf(e))}</td>
                  <td>
                    <span className={`badge ${PAYROLL_STATUS_BADGE[e.status]}`}>
                      <span className="dot" />
                      {e.status}
                    </span>
                  </td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        className="icon-btn view"
                        title="Payslip"
                        onClick={() => open("slip", e.id)}
                      >
                        <FileText className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
                      </button>
                      {e.status === "Pending" && (
                        <button
                          type="button"
                          className="icon-btn"
                          title="Process"
                          style={{ color: "#4ADE80" }}
                          onClick={() => open("process", e.id)}
                        >
                          <Check className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
                        </button>
                      )}
                      {menuFor(e)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className={`text-center py-14${filtered.length ? " hidden" : ""}`}>
          <div className="text-[38px] opacity-30 mb-2">💼</div>
          <div className="text-sm font-bold c-text">No employees found</div>
          <div className="text-xs mt-1 c-dim">Try a different tab, department, or search</div>
        </div>
        <div className="flex items-center justify-between px-4 py-3 bd-t">
          <span className="text-xs c-dim2">
            Showing <span>{filtered.length}</span> of <span>{staff.length}</span> employees
          </span>
          <span className="text-xs c-dim2">
            Net total: <span className="c-gold font-bold">{filteredNet}</span>
          </span>
        </div>
      </div>

      {/* ══════════════ MODALS ══════════════ */}
      <PayslipModal
        employee={modal === "slip" ? target : null}
        onClose={close}
        onDownload={page.downloadSlip}
      />
      <PayrollFormModal
        key={`form-${target?.id ?? "new"}`}
        open={modal === "form"}
        target={modal === "form" ? target : null}
        onClose={close}
        onSubmit={page.saveStaff}
      />
      <PayrollViewModal
        employee={modal === "view" ? target : null}
        onClose={close}
        onSlip={() => setModal("slip")}
        onProcess={() => setModal("process")}
        onEdit={() => setModal("form")}
      />
      <PayrollProcessModal
        employee={modal === "process" ? target : null}
        onClose={close}
        onConfirm={page.processSalary}
      />
      <PayrollPaymentModal
        key={`payment-${target?.id ?? "none"}`}
        employee={modal === "payment" ? target : null}
        onClose={close}
        onConfirm={page.recordPayment}
      />
      <PayrollDeleteModal
        employee={modal === "delete" ? target : null}
        onClose={close}
        onConfirm={page.deleteStaff}
      />

      <Toast message={page.toast.message} visible={page.toast.visible} />
    </>
  );
};

export default Payroll;

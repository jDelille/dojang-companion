import { useState } from "react";
import {
  Calendar,
  Check,
  CircleCheck,
  CircleCheckBig,
  CircleX,
  Clock,
  Download,
  Eye,
  Layers,
  MoreVertical,
  Paperclip,
  Pencil,
  Plus,
  Search,
  Trash2,
  TrendingDown,
} from "lucide-react";
import type { Expense } from "../../types/expenses";
import {
  CAT_META,
  EXPENSE_CATS,
  EXPENSE_STATUS_BADGE,
} from "../../utils/json/expensesData";
import { moneyWhole } from "../../utils/formatUtils";
import RowMenu from "../../components/common/rowMenu";
import Toast from "../../components/common/Toast";
import { EXPENSE_CAT_ICON, METHOD_FALLBACK, METHOD_ICON } from "./expenseIcons";
import useExpenses from "./useExpenses";
import ExpenseFormModal from "./modal/expenseFormModal";
import ExpenseViewModal from "./modal/expenseViewModal";
import ExpenseApproveModal from "./modal/expenseApproveModal";
import ExpenseRejectModal from "./modal/expenseRejectModal";
import ExpenseReceiptModal from "./modal/expenseReceiptModal";
import ExpenseDeleteModal from "./modal/expenseDeleteModal";

/*
   Expenses — ported from tailwind/src/expenses.html and assets/js/expenses.js.
   Expense table, category breakdown, 6-month trend and the full modal suite.
*/

const TABS = [
  { tab: "All", label: "All", Icon: null },
  { tab: "Paid", label: "Paid", Icon: CircleCheckBig },
  { tab: "Pending", label: "Pending", Icon: Clock },
  { tab: "Rejected", label: "Rejected", Icon: CircleX },
];

const TREND_MONTHS = ["Feb", "Mar", "Apr", "May", "Jun", "Jul"];

type ModalKind = "form" | "view" | "approve" | "reject" | "receipt" | "delete";

const Expenses = () => {
  const page = useExpenses();
  const {
    expenses,
    filtered,
    filteredTotal,
    categoryTotals,
    trend,
    kpis,
    tab,
    setTab,
    cat,
    setCat,
    search,
    setSearch,
  } = page;

  const [modal, setModal] = useState<ModalKind | null>(null);
  const [targetId, setTargetId] = useState<number | null>(null);
  const target = targetId != null ? page.find(targetId) : null;

  const open = (kind: ModalKind, id: number | null) => {
    setTargetId(id);
    setModal(kind);
  };
  const close = () => setModal(null);

  /* Per-row menu — Approve and Reject appear only when the status allows. */
  const menuFor = (e: Expense) => (
    <RowMenu
      triggerClassName="exp-menu-btn"
      triggerTitle="More"
      trigger={<MoreVertical className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />}
    >
      <button type="button" className="dropdown-item" onClick={() => open("view", e.id)}>
        <Eye className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        View Details
      </button>
      <button type="button" className="dropdown-item" onClick={() => open("form", e.id)}>
        <Pencil className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        Edit
      </button>
      <button type="button" className="dropdown-item" onClick={() => open("receipt", e.id)}>
        <Paperclip className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        {e.receipt ? "Replace Receipt" : "Attach Receipt"}
      </button>
      {e.status !== "Paid" && (
        <button type="button" className="dropdown-item ok" onClick={() => open("approve", e.id)}>
          <CircleCheck className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          Approve
        </button>
      )}
      {e.status !== "Rejected" && (
        <button type="button" className="dropdown-item" onClick={() => open("reject", e.id)}>
          <CircleX className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          Reject
        </button>
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
          <h2 className="text-xl font-black c-text">Expenses</h2>
          <p className="text-sm mt-0.5 c-dim">
            Track operational costs &amp; spending · July 2026 · Austin HQ
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="btn-ghost flex items-center gap-2 px-3.5 py-2 text-sm"
            onClick={page.exportExpenses}
          >
            <Download className="w-[14px] h-[14px] shrink-0" aria-hidden="true" />
            Export
          </button>
          <button
            type="button"
            className="btn-gold flex items-center gap-2 px-4 py-2.5 text-sm"
            onClick={() => open("form", null)}
          >
            <Plus className="w-[14px] h-[14px] shrink-0" aria-hidden="true" />
            Add Expense
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="sc-finance reveal">
          <div className="sc-finance-strip">
            <div className="icon-box ic-red">
              <TrendingDown className="w-[16px] h-[16px] c-red shrink-0" aria-hidden="true" />
            </div>
            <div className="text-xs font-medium c-dim">Total This Month</div>
          </div>
          <div className="sc-finance-body">
            <div className="text-2xl font-black c-text leading-none">{kpis.total}</div>
          </div>
        </div>
        <div className="sc-finance reveal">
          <div className="sc-finance-strip">
            <div className="icon-box ic-orange">
              <Calendar className="w-[16px] h-[16px] c-orange shrink-0" aria-hidden="true" />
            </div>
            <div className="text-xs font-medium c-dim">Daily Average</div>
          </div>
          <div className="sc-finance-body">
            <div className="text-2xl font-black c-text leading-none">{kpis.avg}</div>
          </div>
        </div>
        <div className="sc-finance reveal">
          <div className="sc-finance-strip">
            <div className="icon-box ic-gold">
              <Layers className="w-[16px] h-[16px] c-gold shrink-0" aria-hidden="true" />
            </div>
            <div className="text-xs font-medium c-dim">Top Category</div>
          </div>
          <div className="sc-finance-body">
            <div className="text-2xl font-black c-text leading-none">{kpis.top}</div>
          </div>
        </div>
        <div className="sc-finance reveal">
          <div className="sc-finance-strip">
            <div className="icon-box ic-purple">
              <Clock className="w-[16px] h-[16px] c-purple shrink-0" aria-hidden="true" />
            </div>
            <div className="text-xs font-medium c-dim">Pending Approval</div>
          </div>
          <div className="sc-finance-body">
            <div className="text-2xl font-black c-text leading-none">{kpis.pending}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Left: table */}
        <div className="xl:col-span-2">
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
                value={cat}
                onChange={(e) => setCat(e.target.value)}
              >
                <option value="All">All Categories</option>
                {EXPENSE_CATS.map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </select>
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
          </div>

          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="data-table table-sticky min-w-[720px]">
                <thead>
                  <tr>
                    <th>Expense</th>
                    <th>Category</th>
                    <th>Date</th>
                    <th>Method</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((e) => {
                    const meta = CAT_META[e.category];
                    const CatIcon = EXPENSE_CAT_ICON[e.category];
                    const MethodIcon = METHOD_ICON[e.method] ?? METHOD_FALLBACK;
                    return (
                      <tr key={e.id}>
                        <td>
                          <div className="flex items-center gap-3">
                            <div className={`exp-ic ${meta.cls}`}>
                              <CatIcon
                                className="w-[15px] h-[15px] shrink-0"
                                style={{ color: meta.color }}
                                aria-hidden="true"
                              />
                            </div>
                            <span className="font-semibold c-text">
                              {e.title}
                              {e.receipt && (
                                <>
                                  {" "}
                                  <Paperclip
                                    className="inline w-[12px] h-[12px] c-dim2 shrink-0"
                                    aria-hidden="true"
                                  />
                                </>
                              )}
                            </span>
                          </div>
                        </td>
                        <td>{e.category}</td>
                        <td className="text-[12px] c-dim">{e.date}</td>
                        <td>
                          <span className="flex items-center gap-1.5 text-[13px] c-text2">
                            <MethodIcon
                              style={{ width: "13px", height: "13px", color: "#6B7280" }}
                              className="shrink-0"
                              aria-hidden="true"
                            />
                            {e.method}
                          </span>
                        </td>
                        <td className="font-bold c-text">{moneyWhole(e.amount)}</td>
                        <td>
                          <span className={`badge ${EXPENSE_STATUS_BADGE[e.status]}`}>
                            <span className="dot" />
                            {e.status}
                          </span>
                        </td>
                        <td className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {e.status === "Pending" && (
                              <button
                                type="button"
                                className="icon-btn"
                                title="Approve"
                                style={{ color: "#4ADE80" }}
                                onClick={() => open("approve", e.id)}
                              >
                                <Check
                                  className="w-[15px] h-[15px] shrink-0"
                                  aria-hidden="true"
                                />
                              </button>
                            )}
                            <button
                              type="button"
                              className="icon-btn view"
                              title="View"
                              onClick={() => open("view", e.id)}
                            >
                              <Eye className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
                            </button>
                            {menuFor(e)}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className={`text-center py-14${filtered.length ? " hidden" : ""}`}>
              <div className="text-[38px] opacity-30 mb-2">🧾</div>
              <div className="text-sm font-bold c-text">No expenses found</div>
              <div className="text-xs mt-1 c-dim">Try a different tab, category, or search</div>
            </div>
            <div className="flex items-center justify-between px-4 py-3 bd-t">
              <span className="text-xs c-dim2">
                Showing <span>{filtered.length}</span> of <span>{expenses.length}</span> expenses
              </span>
              <span className="text-xs c-dim2">
                Filtered total: <span className="c-gold font-bold">{filteredTotal}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right: breakdown + trend */}
        <div className="space-y-5">
          {/* Category breakdown */}
          <div className="glass-card p-4">
            <h3 className="font-bold c-text sec-title mb-4">By Category</h3>
            <div className="space-y-3.5">
              {categoryTotals.map(({ category, amount, pct, meta }) => {
                const Icon = EXPENSE_CAT_ICON[category];
                return (
                  <div key={category}>
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <div
                        className={`exp-ic ${meta.cls}`}
                        style={{ width: "28px", height: "28px" }}
                      >
                        <Icon
                          className="w-[13px] h-[13px] shrink-0"
                          style={{ color: meta.color }}
                          aria-hidden="true"
                        />
                      </div>
                      <span className="text-[13px] font-semibold c-text flex-1">{category}</span>
                      <span className="text-[13px] font-bold c-text">{moneyWhole(amount)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="cat-track flex-1">
                        <div
                          className="cat-fill"
                          style={{ width: `${pct}%`, background: meta.color }}
                        />
                      </div>
                      <span
                        className="text-[11px] font-bold c-dim"
                        style={{ minWidth: "30px", textAlign: "right" }}
                      >
                        {pct}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 6-month trend */}
          <div className="glass-card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold c-text sec-title">6-Month Trend</h3>
              <span className="text-[11px] c-dim">$ thousands</span>
            </div>
            <div className="mini-bars">
              {trend.map((bar, i) => (
                <div
                  key={TREND_MONTHS[i]}
                  title={`$${bar.value}k`}
                  style={{
                    height: `${bar.height}%`,
                    ...(bar.isCurrent
                      ? { background: "linear-gradient(180deg,#F4D03F,#D4AF37)" }
                      : {}),
                  }}
                />
              ))}
            </div>
            <div className="flex items-center justify-between mt-2 text-[10px] c-dim2 font-semibold">
              {TREND_MONTHS.map((m) => (
                <span key={m}>{m}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════ MODALS ══════════════ */}
      <ExpenseFormModal
        key={`form-${target?.id ?? "new"}`}
        open={modal === "form"}
        target={modal === "form" ? target : null}
        onClose={close}
        onSubmit={page.saveExpense}
      />
      <ExpenseViewModal
        expense={modal === "view" ? target : null}
        onClose={close}
        onReceipt={() => setModal("receipt")}
        onApprove={() => setModal("approve")}
        onEdit={() => setModal("form")}
      />
      <ExpenseApproveModal
        expense={modal === "approve" ? target : null}
        onClose={close}
        onConfirm={page.approveExpense}
      />
      <ExpenseRejectModal
        key={`reject-${target?.id ?? "none"}`}
        expense={modal === "reject" ? target : null}
        onClose={close}
        onConfirm={page.rejectExpense}
      />
      <ExpenseReceiptModal
        expense={modal === "receipt" ? target : null}
        onClose={close}
        onConfirm={page.attachReceipt}
      />
      <ExpenseDeleteModal
        expense={modal === "delete" ? target : null}
        onClose={close}
        onConfirm={page.deleteExpense}
      />

      <Toast message={page.toast.message} visible={page.toast.visible} />
    </>
  );
};

export default Expenses;

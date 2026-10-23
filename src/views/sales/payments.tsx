import { useState } from "react";
import {
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  Download,
  Eye,
  Landmark,
  Plus,
  Receipt,
  RotateCcw,
  Search,
  XCircle,
} from "lucide-react";
import Toast from "../../components/common/Toast";
import useToast from "../../hooks/useToast";
import type { Txn } from "../../types/sales";
import { METHOD_META, METHOD_ORDER, TXN_STATUS_BADGE } from "../../utils/json/salesData";
import { initials, money } from "../../utils/salesUtils";
import METHOD_ICON from "./methodIcon";
import usePayments, { TXN_TABS, type MethodFilter, type TxnTab } from "./usePayments";
import RecordPaymentModal from "./modal/recordPaymentModal";
import TxnDetailModal from "./modal/txnDetailModal";
import ReceiptModal from "./modal/receiptModal";
import RefundModal from "./modal/refundModal";
import SettlementModal from "./modal/settlementModal";

/*
   Payments — ported from tailwind/src/payments.html + assets/js/payments.js.

   The template's renderMix()/renderRefunds() wrote the side column with
   innerHTML; here both derive from usePayments and render as JSX.
*/

const METHOD_OPTIONS = [
  { value: "All", label: "All Methods" },
  ...METHOD_ORDER.map((method) => ({ value: method, label: method })),
];

const TAB_ICON: Record<TxnTab, typeof CheckCircle2 | null> = {
  All: null,
  Success: CheckCircle2,
  Pending: Clock,
  Failed: XCircle,
  Refunded: RotateCcw,
};

const Payments = () => {
  const {
    txns,
    tab,
    setTab,
    search,
    setSearch,
    method,
    setMethod,
    kpis,
    counts,
    visible,
    methodTotals,
    refunds,
    settlementTotal,
    settlementRows,
    refund,
    recordPayment,
  } = usePayments();
  const { message, visible: toastVisible, showToast } = useToast();

  const [detail, setDetail] = useState<Txn | null>(null);
  const [receipt, setReceipt] = useState<Txn | null>(null);
  const [refundTarget, setRefundTarget] = useState<Txn | null>(null);
  const [recordOpen, setRecordOpen] = useState(false);
  const [settleOpen, setSettleOpen] = useState(false);

  return (
    <>
      {/* Page header */}
      <div className="flex md:items-center justify-between flex-wrap xl:flex-nowrap gap-4 mb-5">
        <div>
          <h2 className="text-xl font-black c-text">Payments</h2>
          <p className="text-sm mt-0.5 c-dim">
            Track transactions, settlements &amp; refunds · Austin HQ
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="btn-ghost flex items-center gap-2 px-3.5 py-2 text-sm"
            onClick={() => showToast("Transactions exported")}
          >
            <Download className="w-[14px] h-[14px] shrink-0" aria-hidden="true" />
            Export
          </button>
          <button
            type="button"
            className="btn-ghost flex items-center gap-2 px-3.5 py-2 text-sm"
            onClick={() => setSettleOpen(true)}
          >
            <Landmark className="w-[14px] h-[14px] shrink-0" aria-hidden="true" />
            Settlements
          </button>
          <button
            type="button"
            className="btn-gold flex items-center gap-2 px-4 py-2.5 text-sm"
            onClick={() => setRecordOpen(true)}
          >
            <Plus className="w-[14px] h-[14px] shrink-0" aria-hidden="true" />
            Record Payment
          </button>
        </div>
      </div>
      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="sc-sales reveal">
          <span className="sc-sales-bar" />
          <div className="icon-box ic-green">
            <DollarSign className="w-[18px] h-[18px] c-green shrink-0" aria-hidden="true" />
          </div>
          <div>
            <div className="text-2xl font-black c-text leading-none">{money(kpis.received)}</div>
            <div className="text-xs font-medium mt-1 c-dim">Total Received</div>
          </div>
        </div>
        <div className="sc-sales reveal">
          <span className="sc-sales-bar" />
          <div className="icon-box ic-gold">
            <Calendar className="w-[18px] h-[18px] c-gold shrink-0" aria-hidden="true" />
          </div>
          <div>
            <div className="text-2xl font-black c-text leading-none">{money(kpis.today)}</div>
            <div className="text-xs font-medium mt-1 c-dim">Today&apos;s Collection</div>
          </div>
        </div>
        <div className="sc-sales reveal">
          <span className="sc-sales-bar" />
          <div className="icon-box ic-orange">
            <Clock className="w-[18px] h-[18px] c-orange shrink-0" aria-hidden="true" />
          </div>
          <div>
            <div className="text-2xl font-black c-text leading-none">{money(kpis.pending)}</div>
            <div className="text-xs font-medium mt-1 c-dim">Pending</div>
          </div>
        </div>
        <div className="sc-sales reveal">
          <span className="sc-sales-bar" />
          <div className="icon-box ic-red">
            <RotateCcw className="w-[18px] h-[18px] c-red shrink-0" aria-hidden="true" />
          </div>
          <div>
            <div className="text-2xl font-black c-text leading-none">{money(kpis.refunded)}</div>
            <div className="text-xs font-medium mt-1 c-dim">Refunded</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Transactions */}
        <div className="xl:col-span-2">
          {/* Status tabs */}
          <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
            {TXN_TABS.map((name) => {
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

          {/* Toolbar */}
          <div className="glass-card p-4 mb-4 flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[180px]">
              <Search
                className="search-icon absolute left-3 top-1/2 -translate-y-1/2 w-[14px] h-[14px]"
                aria-hidden="true"
              />
              <input
                type="text"
                className="fp-input pl-9 py-2 text-sm"
                placeholder="Search txn ID or customer…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            {/* Native select, as in the template — the toolbar filter keeps
                the browser control rather than the shared CommonSelect. */}
            <select
              className="fp-input py-2 text-sm w-auto"
              aria-label="Filter by method"
              value={method}
              onChange={(e) => setMethod(e.target.value as MethodFilter)}
            >
              {METHOD_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="data-table table-sticky min-w-[820px]">
                <thead>
                  <tr>
                    <th>Transaction</th>
                    <th>Customer</th>
                    <th>Method</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((txn) => {
                    const meta = METHOD_META[txn.method];
                    const Icon = METHOD_ICON[txn.method];
                    return (
                      <tr key={txn.id}>
                        <td className="font-mono text-xs font-bold c-gold">{txn.id}</td>
                        <td>
                          <div className="flex items-center gap-2.5">
                            <div
                              className="pay-method av av-gold"
                              style={{ width: "30px", height: "30px", fontSize: "11px" }}
                            >
                              {initials(txn.customer)}
                            </div>
                            <span className="font-semibold c-text">{txn.customer}</span>
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <div
                              className={`pay-method ${meta.cls}`}
                              style={{ width: "28px", height: "28px" }}
                            >
                              <Icon
                                className="w-[13px] h-[13px] shrink-0"
                                style={{ color: meta.color }}
                                aria-hidden="true"
                              />
                            </div>
                            <span className="text-[13px]">{txn.method}</span>
                          </div>
                        </td>
                        <td
                          className={
                            txn.status === "Refunded" ? "font-bold c-red" : "font-bold c-text"
                          }
                        >
                          {(txn.status === "Refunded" ? "−" : "") + money(txn.amount)}
                        </td>
                        <td>
                          <span className={`badge ${TXN_STATUS_BADGE[txn.status]}`}>
                            <span className="dot" />
                            {txn.status}
                          </span>
                        </td>
                        <td className="text-[12px] c-dim">{txn.date}</td>
                        <td className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              className="icon-btn view"
                              title="Details"
                              onClick={() => setDetail(txn)}
                            >
                              <Eye className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
                            </button>
                            <button
                              type="button"
                              className="icon-btn"
                              title="Receipt"
                              onClick={() => setReceipt(txn)}
                            >
                              <Receipt className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
                            </button>
                            {txn.status === "Success" && (
                              <button
                                type="button"
                                className="icon-btn danger"
                                title="Refund"
                                onClick={() => setRefundTarget(txn)}
                              >
                                <RotateCcw className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {visible.length === 0 && (
              <div className="text-center py-14">
                <div className="text-[38px] opacity-30 mb-2">💳</div>
                <div className="text-sm font-bold c-text">No transactions found</div>
                <div className="text-xs mt-1 c-dim">Try a different tab, search, or method</div>
              </div>
            )}
            <div className="flex items-center justify-between px-4 py-3 bd-t">
              <span className="text-xs c-dim2">
                Showing <span>{visible.length}</span> of <span>{txns.length}</span> transactions
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
        </div>

        {/* Side column */}
        <div className="space-y-5">
          {/* Payment mix */}
          <div className="glass-card p-4">
            <h3 className="font-bold c-text sec-title mb-4">Payment Methods</h3>
            <div className="space-y-4">
              {methodTotals.map((row) => {
                const meta = METHOD_META[row.method];
                const Icon = METHOD_ICON[row.method];
                return (
                  <div key={row.method}>
                    <div className="mix-row mb-1.5">
                      <div className={`pay-method ${meta.cls}`}>
                        <Icon
                          className="w-[15px] h-[15px] shrink-0"
                          style={{ color: meta.color }}
                          aria-hidden="true"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[13px] font-semibold c-text">{row.method}</span>
                          <span className="text-[13px] font-bold c-text">{money(row.amount)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="mix-row">
                      <div className="mix-bar">
                        <div
                          className="mix-fill"
                          style={{ width: `${row.percent}%`, background: meta.color }}
                        />
                      </div>
                      <span
                        className="text-[11px] font-bold c-dim"
                        style={{ minWidth: "32px", textAlign: "right" }}
                      >
                        {row.percent}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent refunds */}
          <div className="glass-card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold c-text sec-title">Refund Requests</h3>
              <span className="badge badge-expired">{refunds.length}</span>
            </div>
            <div className="space-y-2.5">
              {refunds.length ? (
                refunds.map((txn) => (
                  <div key={txn.id} className="list-row flex items-center gap-3 p-2.5">
                    <div className="pay-method ic-red">
                      <RotateCcw className="w-[14px] h-[14px] c-red shrink-0" aria-hidden="true" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-semibold c-text truncate">
                        {txn.customer}
                      </div>
                      <div className="text-[11px] c-dim">
                        {txn.id} · {txn.method}
                      </div>
                    </div>
                    <div className="text-sm font-black c-red">−{money(txn.amount)}</div>
                  </div>
                ))
              ) : (
                <div className="text-xs c-dim text-center py-4">No refund requests ✓</div>
              )}
            </div>
          </div>
        </div>
      </div>

      <RecordPaymentModal
        open={recordOpen}
        onClose={() => setRecordOpen(false)}
        onRecord={(input) => {
          recordPayment(input);
          showToast("Payment recorded");
        }}
      />
      <TxnDetailModal
        txn={detail}
        onClose={() => setDetail(null)}
        onReceipt={(txn) => setReceipt(txn)}
        onRefund={(txn) => setRefundTarget(txn)}
      />
      <ReceiptModal
        txn={receipt}
        onClose={() => setReceipt(null)}
        onAction={(text) => {
          showToast(text);
          setReceipt(null);
        }}
      />
      <RefundModal
        txn={refundTarget}
        onClose={() => setRefundTarget(null)}
        onConfirm={(txn) => {
          refund(txn.id);
          showToast(`${txn.id} refunded`);
          setRefundTarget(null);
          setDetail(null);
        }}
      />
      <SettlementModal
        open={settleOpen}
        onClose={() => setSettleOpen(false)}
        total={settlementTotal}
        rows={settlementRows}
        onSettle={() => {
          setSettleOpen(false);
          showToast("Settlement initiated — payout scheduled");
        }}
      />
      <Toast message={message} visible={toastVisible} />
    </>
  );
};

export default Payments;

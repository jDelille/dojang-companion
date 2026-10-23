import { useMemo, useState } from "react";
import { Download, Eye, History, Printer, Search, X } from "lucide-react";
import PosModal from "../posModal";
import { TX_PER_PAGE } from "../posData";
import { cur } from "../posUtils";
import { spawnRipple } from "../ripple";
import type { Transaction, TxStatus } from "../types";

/*
   Order History, ported from #modal-recent-tx, txRows(), renderTx() and
   renderTxPager() in tailwind/src/pos.html and assets/js/pos.js.

   The template's Prev/1/2/3/Next markup was static and inert; the pager here
   reflects real pages.
*/

const STATUS_BADGE: Record<TxStatus, string> = {
  Paid: "badge-paid",
  Refunded: "badge-expired",
  "Partially Refunded": "badge-pending",
  Pending: "badge-pending",
};

const METHOD_CLASS: Record<string, string> = {
  Cash: "m-cash",
  Card: "m-card",
  "Apple Pay": "m-upi",
  Wallet: "m-wallet",
};

type RecentTxModalProps = {
  open: boolean;
  onClose: () => void;
  transactions: Transaction[];
  onView: (id: string) => void;
  onReprint: (id: string) => void;
  onExport: (rows: Transaction[]) => void;
};

const RecentTxModal = ({
  open,
  onClose,
  transactions,
  onView,
  onReprint,
  onExport,
}: RecentTxModalProps) => {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [method, setMethod] = useState("All");
  const [page, setPage] = useState(1);

  const rows = useMemo(() => {
    const q = query.toLowerCase();
    return transactions.filter((t) => {
      const mq = !q || (t.id + t.name + t.items).toLowerCase().includes(q);
      const ms = status === "All" || t.status === status;
      const mm = method === "All" || t.method === method;
      return mq && ms && mm;
    });
  }, [transactions, query, status, method]);

  const pages = Math.max(1, Math.ceil(rows.length / TX_PER_PAGE));
  const current = Math.min(page, pages);
  const shown = rows.slice((current - 1) * TX_PER_PAGE, current * TX_PER_PAGE);

  return (
    <PosModal
      open={open}
      onClose={onClose}
      boxClassName="glass p-0! flex flex-col modal-wide"
      head={
        <div className="flex items-center justify-between p-5 pb-4 bd-b">
          <div className="flex items-center gap-2.5">
            <div className="icon-box w-9! h-9! grad-gold">
              <History className="ic-17 t-ink" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-base font-black c-text leading-none">
                Order History
              </h3>
              <div className="text-[11px] mt-0.5 t-muted">
                <span>{rows.length}</span> of <span>{transactions.length}</span> today
              </div>
            </div>
          </div>
          <button
            type="button"
            className="modal-x"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="ic-15" aria-hidden="true" />
          </button>
        </div>
      }
    >
      <div className="flex flex-wrap items-center gap-2.5 p-4 bd-b">
        <div className="relative flex-1 min-w-[180px]">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 ic-14 t-dim"
            aria-hidden="true"
          />
          <input
            type="text"
            className="fp-input pl-9 py-2 text-sm"
            placeholder="Search invoice, member, item…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <select
          className="fp-input py-2 text-sm w-auto"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="All">All Status</option>
          <option value="Paid">Paid</option>
          <option value="Pending">Pending</option>
          <option value="Refunded">Refunded</option>
        </select>
        <select
          className="fp-input py-2 text-sm w-auto"
          value={method}
          onChange={(e) => setMethod(e.target.value)}
        >
          <option value="All">All Methods</option>
          <option>Cash</option>
          <option>Card</option>
          <option>Apple Pay</option>
          <option>Wallet</option>
        </select>
        <button
          type="button"
          className="btn-ghost ripple flex items-center gap-1.5 px-3 py-2 text-xs"
          onClick={(e) => {
            spawnRipple(e);
            onExport(rows);
          }}
        >
          <Download className="ic-13" aria-hidden="true" />
          Export
        </button>
      </div>

      <div className="flex-1 overflow-auto mh-52">
        <table className="w-full data-table minw-820">
          <thead className="table-sticky-head">
            <tr>
              <th className="text-left">Invoice</th>
              <th className="text-left">Member</th>
              <th className="text-left">Items / Plan</th>
              <th className="text-left">Amount</th>
              <th className="text-left">Method</th>
              <th className="text-left">Cashier</th>
              <th className="text-left">Date &amp; Time</th>
              <th className="text-left">Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((t) => (
              <tr key={t.id}>
                <td className="text-xs font-semibold t-gold">{t.id}</td>
                <td className="text-xs font-semibold c-text">{t.name}</td>
                <td className="text-xs t-mute2 max-w-[160px]">
                  <span className="truncate block">{t.items}</span>
                </td>
                <td className="text-xs font-bold c-text">{cur(t.amt)}</td>
                <td>
                  <span
                    className={`text-[11px] font-semibold ${METHOD_CLASS[t.method] || "t-soft"}`}
                  >
                    {t.method}
                  </span>
                </td>
                <td className="text-xs t-muted">{t.cashier}</td>
                <td className="text-xs whitespace-nowrap t-muted">{t.date}</td>
                <td>
                  <span
                    className={`${STATUS_BADGE[t.status]} text-[10px] font-bold px-2 py-0.5 rounded-full`}
                  >
                    {t.status}
                  </span>
                </td>
                <td>
                  <div className="flex gap-1 justify-end">
                    <button
                      type="button"
                      className="pos-iconbtn view"
                      title="View"
                      onClick={() => onView(t.id)}
                    >
                      <Eye className="ic-13" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      className="pos-iconbtn"
                      title="Reprint"
                      onClick={() => onReprint(t.id)}
                    >
                      <Printer className="ic-13" aria-hidden="true" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!shown.length && (
          <div className="text-center py-16">
            <div className="empty-emoji">🧾</div>
            <div className="text-sm font-bold c-text">No transactions found</div>
            <div className="text-xs mt-1 t-muted">
              Try a different search or filter
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between p-4 bd-t">
        <span className="text-xs t-dim">
          Showing <span>{shown.length}</span> results
        </span>
        <div className="flex gap-1">
          {pages > 1 && (
            <>
              <button
                type="button"
                className="page-btn"
                disabled={current === 1}
                onClick={() => setPage(current - 1)}
              >
                Prev
              </button>
              {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  type="button"
                  className={p === current ? "page-btn active" : "page-btn"}
                  aria-current={p === current ? "page" : undefined}
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              ))}
              <button
                type="button"
                className="page-btn"
                disabled={current === pages}
                onClick={() => setPage(current + 1)}
              >
                Next
              </button>
            </>
          )}
        </div>
      </div>
    </PosModal>
  );
};

export default RecentTxModal;

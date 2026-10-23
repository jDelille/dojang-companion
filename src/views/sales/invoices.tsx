import { useState } from "react";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  FileText,
  Hourglass,
  Pencil,
  Plus,
  Search,
  Send,
} from "lucide-react";
import Toast from "../../components/common/Toast";
import useToast from "../../hooks/useToast";
import type { Invoice, InvoiceSort } from "../../types/sales";
import { INVOICE_STATUS_BADGE } from "../../utils/json/salesData";
import { avatarFor, initials, money, totalOf } from "../../utils/salesUtils";
import useInvoices, { INVOICE_TABS, type InvoiceTab } from "./useInvoices";
import InvoicePreviewModal from "./modal/invoicePreviewModal";
import CreateInvoiceModal from "./modal/createInvoiceModal";
import SendInvoiceModal from "./modal/sendInvoiceModal";

/*
   Invoices — ported from tailwind/src/invoices.html + assets/js/invoices.js.

   The template rendered rows with innerHTML and toggled classes by hand; here
   useInvoices owns the data and the table maps over its derived list.
*/

const SORT_OPTIONS = [
  { value: "recent", label: "Sort: Most Recent" },
  { value: "amount-desc", label: "Amount: High → Low" },
  { value: "amount-asc", label: "Amount: Low → High" },
  { value: "due", label: "Due Date" },
];

const TAB_ICON: Record<InvoiceTab, typeof CheckCircle2 | null> = {
  All: null,
  Paid: CheckCircle2,
  Unpaid: Clock,
  Overdue: AlertCircle,
  Draft: Pencil,
};

const Invoices = () => {
  const {
    invoices,
    tab,
    setTab,
    search,
    setSearch,
    sort,
    setSort,
    kpis,
    counts,
    visible,
    markPaid,
    createInvoice,
  } = useInvoices();
  const { message, visible: toastVisible, showToast } = useToast();

  const [preview, setPreview] = useState<Invoice | null>(null);
  const [sendTarget, setSendTarget] = useState<Invoice | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const handleSend = (invoice: Invoice, channel?: string) => {
    showToast(channel ? `${invoice.id} sent via ${channel}` : `Invoice ${invoice.id} sent`);
    setSendTarget(null);
  };

  return (
    <>
      {/* Page header */}
      <div className="flex md:items-center justify-between flex-wrap xl:flex-nowrap gap-4 mb-5">
        <div>
          <h2 className="text-xl font-black c-text">Invoices</h2>
          <p className="text-sm mt-0.5 c-dim">
            Create, send &amp; track invoices · Austin HQ
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="btn-ghost flex items-center gap-2 px-3.5 py-2 text-sm"
            onClick={() => showToast("Invoices exported")}
          >
            <Download className="w-[14px] h-[14px] shrink-0" aria-hidden="true" />
            Export
          </button>
          <button
            type="button"
            className="btn-gold flex items-center gap-2 px-4 py-2.5 text-sm"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="w-[14px] h-[14px] shrink-0" aria-hidden="true" />
            Create Invoice
          </button>
        </div>
      </div>
      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="sc-sales reveal">
          <span className="sc-sales-bar" />
          <div className="icon-box ic-gold">
            <FileText className="w-[18px] h-[18px] c-gold shrink-0" aria-hidden="true" />
          </div>
          <div>
            <div className="text-2xl font-black c-text leading-none">
              {money(kpis.totalInvoiced)}
            </div>
            <div className="text-xs font-medium mt-1 c-dim">Total Invoiced</div>
          </div>
        </div>
        <div className="sc-sales reveal">
          <span className="sc-sales-bar" />
          <div className="icon-box ic-green">
            <CheckCircle2 className="w-[18px] h-[18px] c-green shrink-0" aria-hidden="true" />
          </div>
          <div>
            <div className="text-2xl font-black c-text leading-none">{money(kpis.paid)}</div>
            <div className="text-xs font-medium mt-1 c-dim">Paid</div>
          </div>
        </div>
        <div className="sc-sales reveal">
          <span className="sc-sales-bar" />
          <div className="icon-box ic-orange">
            <Hourglass className="w-[18px] h-[18px] c-orange shrink-0" aria-hidden="true" />
          </div>
          <div>
            <div className="text-2xl font-black c-text leading-none">
              {money(kpis.outstanding)}
            </div>
            <div className="text-xs font-medium mt-1 c-dim">Outstanding</div>
          </div>
        </div>
        <div className="sc-sales reveal">
          <span className="sc-sales-bar" />
          <div className="icon-box ic-red">
            <AlertCircle className="w-[18px] h-[18px] c-red shrink-0" aria-hidden="true" />
          </div>
          <div>
            <div className="text-2xl font-black c-text leading-none">{kpis.overdueCount}</div>
            <div className="text-xs font-medium mt-1 c-dim">Overdue Invoices</div>
          </div>
        </div>
      </div>
      {/* Status tabs */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
        {INVOICE_TABS.map((name) => {
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
        <div className="relative flex-1 min-w-[200px]">
          <Search
            className="search-icon absolute left-3 top-1/2 -translate-y-1/2 w-[14px] h-[14px]"
            aria-hidden="true"
          />
          <input
            type="text"
            className="fp-input pl-9 py-2 text-sm"
            placeholder="Search invoice # or customer…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {/* Native select, as in the template — the toolbar sort keeps the
            browser control rather than the shared CommonSelect. */}
        <select
          className="fp-input py-2 text-sm w-auto"
          aria-label="Sort invoices"
          value={sort}
          onChange={(e) => setSort(e.target.value as InvoiceSort)}
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      {/* Invoices table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table table-sticky min-w-[920px]">
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Customer</th>
                <th>Issued</th>
                <th>Due</th>
                <th>Amount</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((invoice) => (
                <tr key={invoice.id}>
                  <td className="font-mono text-xs font-bold c-gold">{invoice.id}</td>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <div className={`inv-avatar av ${avatarFor(invoice.id)}`}>
                        {initials(invoice.customer)}
                      </div>
                      <div>
                        <div className="font-semibold c-text">{invoice.customer}</div>
                        <div className="text-[11px] c-dim">{invoice.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="text-[12px] c-dim">{invoice.issued}</td>
                  <td
                    className={
                      invoice.status === "Overdue"
                        ? "text-[12px] c-red font-semibold"
                        : "text-[12px] c-dim"
                    }
                  >
                    {invoice.due}
                  </td>
                  <td className="font-bold c-text">{money(totalOf(invoice))}</td>
                  <td>
                    <span className={`badge ${INVOICE_STATUS_BADGE[invoice.status]}`}>
                      <span className="dot" />
                      {invoice.status}
                    </span>
                  </td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        className="icon-btn view"
                        title="Preview"
                        onClick={() => setPreview(invoice)}
                      >
                        <Eye className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
                      </button>
                      {invoice.status !== "Paid" && invoice.status !== "Draft" && (
                        <button
                          type="button"
                          className="icon-btn"
                          title="Mark paid"
                          style={{ color: "#4ADE80" }}
                          onClick={() => {
                            markPaid(invoice.id);
                            showToast(`${invoice.id} marked paid`);
                          }}
                        >
                          <Check className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
                        </button>
                      )}
                      <button
                        type="button"
                        className="icon-btn"
                        title="Send"
                        onClick={() => setSendTarget(invoice)}
                      >
                        <Send className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {visible.length === 0 && (
          <div className="text-center py-16">
            <div className="text-[42px] opacity-30 mb-2">📄</div>
            <div className="text-sm font-bold c-text">No invoices found</div>
            <div className="text-xs mt-1 c-dim">Try a different tab, search, or sort</div>
          </div>
        )}
        <div className="flex items-center justify-between px-4 py-3 bd-t">
          <span className="text-xs c-dim2">
            Showing <span>{visible.length}</span> of <span>{invoices.length}</span> invoices
          </span>
        </div>
      </div>

      <InvoicePreviewModal
        invoice={preview}
        onClose={() => setPreview(null)}
        onSend={(invoice) => setSendTarget(invoice)}
      />
      <CreateInvoiceModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={(input) => {
          createInvoice(input);
          showToast("Invoice created");
        }}
      />
      {/* Keyed so a different invoice remounts the form with its email. */}
      <SendInvoiceModal
        key={sendTarget?.id ?? "send"}
        invoice={sendTarget}
        onClose={() => setSendTarget(null)}
        onSend={handleSend}
      />
      <Toast message={message} visible={toastVisible} />
    </>
  );
};

export default Invoices;

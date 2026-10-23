import { useState } from "react";
import Link from "next/link";
import {
  Banknote,
  Check,
  CheckCircle2,
  Circle,
  Clock,
  CreditCard,
  DollarSign,
  Download,
  Eye,
  FileText,
  Loader,
  Plus,
  Receipt,
  Search,
  Smartphone,
  Wallet,
  XCircle,
} from "lucide-react";
import Toast from "../../components/common/Toast";
import useToast from "../../hooks/useToast";
import { all_routes } from "../../routes/all_routes";
import type { Order, OrderSort, PayMethod } from "../../types/sales";
import { ORDER_STATUS_BADGE } from "../../utils/json/salesData";
import { avatarFor, initials, itemCount, money, totalOf } from "../../utils/salesUtils";
import useOrders, { ORDER_TABS, type OrderTab, type PayFilter } from "./useOrders";
import OrderDetailModal from "./modal/orderDetailModal";
import OrderInvoiceModal from "./modal/orderInvoiceModal";

/*
   Orders — ported from tailwind/src/orders.html + assets/js/orders.js.

   The template rendered rows with innerHTML and toggled classes by hand; here
   useOrders owns the data and the table maps over its derived list.
*/

const PAY_OPTIONS = [
  { value: "All", label: "All Payments" },
  { value: "Cash", label: "Cash" },
  { value: "Card", label: "Card" },
  { value: "Apple Pay", label: "Apple Pay" },
  { value: "Wallet", label: "Wallet" },
];

const SORT_OPTIONS = [
  { value: "recent", label: "Sort: Most Recent" },
  { value: "amount-desc", label: "Amount: High → Low" },
  { value: "amount-asc", label: "Amount: Low → High" },
];

/* Mirrors PAY_ICON in assets/js/orders.js, as components. */
const PAY_ICON: Record<PayMethod, typeof Banknote> = {
  Cash: Banknote,
  Card: CreditCard,
  "Apple Pay": Smartphone,
  Wallet: Wallet,
};

const TAB_ICON: Record<OrderTab, typeof Clock | null> = {
  All: null,
  Pending: Clock,
  Processing: Loader,
  Completed: CheckCircle2,
  Cancelled: XCircle,
};

/** The first tab reads "All Orders" while its status key stays "All". */
const TAB_LABEL: Record<OrderTab, string> = {
  All: "All Orders",
  Pending: "Pending",
  Processing: "Processing",
  Completed: "Completed",
  Cancelled: "Cancelled",
};

const Orders = () => {
  const {
    orders,
    tab,
    setTab,
    search,
    setSearch,
    pay,
    setPay,
    sort,
    setSort,
    kpis,
    counts,
    visible,
    markComplete,
  } = useOrders();
  const { message, visible: toastVisible, showToast } = useToast();

  const [detail, setDetail] = useState<Order | null>(null);
  const [invoice, setInvoice] = useState<Order | null>(null);

  return (
    <>
      {/* Page header */}
      <div className="flex md:items-center justify-between flex-wrap xl:flex-nowrap gap-4 mb-5">
        <div>
          <h2 className="text-xl font-black c-text">Orders</h2>
          <p className="text-sm mt-0.5 c-dim">
            Track sales orders, fulfillment &amp; payments · Austin HQ
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="btn-ghost flex items-center gap-2 px-3.5 py-2 text-sm"
            onClick={() => showToast("Orders exported")}
          >
            <Download className="w-[14px] h-[14px] shrink-0" aria-hidden="true" />
            Export
          </button>
          <Link href={all_routes.pos} className="btn-gold flex items-center gap-2 px-4 py-2.5 text-sm">
            <Plus className="w-[14px] h-[14px] shrink-0" aria-hidden="true" />
            New Order
          </Link>
        </div>
      </div>
      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="sc-sales reveal">
          <span className="sc-sales-bar" />
          <div className="icon-box ic-gold">
            <Receipt className="w-[18px] h-[18px] c-gold shrink-0" aria-hidden="true" />
          </div>
          <div>
            <div className="text-2xl font-black c-text leading-none">{kpis.total}</div>
            <div className="text-xs font-medium mt-1 c-dim">Total Orders</div>
          </div>
        </div>
        <div className="sc-sales reveal">
          <span className="sc-sales-bar" />
          <div className="icon-box ic-orange">
            <Clock className="w-[18px] h-[18px] c-orange shrink-0" aria-hidden="true" />
          </div>
          <div>
            <div className="text-2xl font-black c-text leading-none">{kpis.pending}</div>
            <div className="text-xs font-medium mt-1 c-dim">Pending</div>
          </div>
        </div>
        <div className="sc-sales reveal">
          <span className="sc-sales-bar" />
          <div className="icon-box ic-green">
            <CheckCircle2 className="w-[18px] h-[18px] c-green shrink-0" aria-hidden="true" />
          </div>
          <div>
            <div className="text-2xl font-black c-text leading-none">{kpis.completed}</div>
            <div className="text-xs font-medium mt-1 c-dim">Completed</div>
          </div>
        </div>
        <div className="sc-sales reveal">
          <span className="sc-sales-bar" />
          <div className="icon-box ic-cyan">
            <DollarSign className="w-[18px] h-[18px] c-cyan shrink-0" aria-hidden="true" />
          </div>
          <div>
            <div className="text-2xl font-black c-text leading-none">{money(kpis.revenue)}</div>
            <div className="text-xs font-medium mt-1 c-dim">Revenue</div>
          </div>
        </div>
      </div>
      {/* Status tabs */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
        {ORDER_TABS.map((name) => {
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
            placeholder="Search order ID or customer…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {/* Native selects, as in the template — the toolbar filter and sort
            keep the browser control rather than the shared CommonSelect. */}
        <select
          className="fp-input py-2 text-sm w-auto"
          aria-label="Filter by payment"
          value={pay}
          onChange={(e) => setPay(e.target.value as PayFilter)}
        >
          {PAY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <select
          className="fp-input py-2 text-sm w-auto"
          aria-label="Sort orders"
          value={sort}
          onChange={(e) => setSort(e.target.value as OrderSort)}
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      {/* Orders table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table table-sticky min-w-[920px]">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Amount</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Date</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((order) => {
                const PayIcon = PAY_ICON[order.pay] ?? Circle;
                const summary =
                  order.items[0].name +
                  (order.items.length > 1 ? ` +${order.items.length - 1} more` : "");
                return (
                  <tr key={order.id}>
                    <td className="font-mono text-xs font-bold c-gold">{order.id}</td>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <div className={`ord-avatar av ${avatarFor(order.id)}`}>
                          {initials(order.customer)}
                        </div>
                        <span className="font-semibold c-text">{order.customer}</span>
                      </div>
                    </td>
                    <td>
                      <div className="c-text2">{summary}</div>
                      <div className="text-[11px] c-dim">{itemCount(order)} item(s)</div>
                    </td>
                    <td className="font-bold c-text">{money(totalOf(order))}</td>
                    <td>
                      {/* Sized here because .pay-chip's CSS targets `i`, and
                          lucide renders an svg. */}
                      <span className="pay-chip">
                        <PayIcon className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
                        {order.pay}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${ORDER_STATUS_BADGE[order.status]}`}>
                        <span className="dot" />
                        {order.status}
                      </span>
                    </td>
                    <td className="text-[12px] c-dim">{order.date}</td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          className="icon-btn view"
                          title="View"
                          onClick={() => setDetail(order)}
                        >
                          <Eye className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          className="icon-btn"
                          title="Invoice"
                          onClick={() => setInvoice(order)}
                        >
                          <FileText className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
                        </button>
                        {(order.status === "Pending" || order.status === "Processing") && (
                          <button
                            type="button"
                            className="icon-btn"
                            title="Mark complete"
                            style={{ color: "#4ADE80" }}
                            onClick={() => {
                              markComplete(order.id);
                              showToast(`${order.id} marked completed`);
                            }}
                          >
                            <Check className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
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
          <div className="text-center py-16">
            <div className="text-[42px] opacity-30 mb-2">🧾</div>
            <div className="text-sm font-bold c-text">No orders found</div>
            <div className="text-xs mt-1 c-dim">Try a different tab, search, or filter</div>
          </div>
        )}
        <div className="flex items-center justify-between px-4 py-3 bd-t">
          <span className="text-xs c-dim2">
            Showing <span>{visible.length}</span> of <span>{orders.length}</span> orders
          </span>
        </div>
      </div>

      <OrderDetailModal
        order={detail}
        onClose={() => setDetail(null)}
        onViewInvoice={(order) => setInvoice(order)}
      />
      <OrderInvoiceModal
        order={invoice}
        onClose={() => setInvoice(null)}
        onAction={(text) => showToast(text)}
      />
      <Toast message={message} visible={toastVisible} />
    </>
  );
};

export default Orders;

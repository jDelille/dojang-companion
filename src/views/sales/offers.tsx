import { useState } from "react";
import {
  BadgeCheck,
  Calendar,
  CalendarClock,
  CheckCircle2,
  Clock,
  Copy,
  DollarSign,
  Download,
  Pencil,
  Percent,
  Plus,
  Power,
  Search,
  Ticket,
  Trash2,
  TrendingDown,
  XCircle,
} from "lucide-react";
import Toast from "../../components/common/Toast";
import useToast from "../../hooks/useToast";
import type { Coupon } from "../../types/sales";
import { COUPON_STATUS_BADGE } from "../../utils/json/salesData";
import { moneyWhole } from "../../utils/salesUtils";
import useOffers, { COUPON_TABS, type CouponTab } from "./useOffers";
import CreateCouponModal from "./modal/createCouponModal";
import EditCouponModal from "./modal/editCouponModal";
import DeleteCouponModal from "./modal/deleteCouponModal";

/*
   Offers & Coupons — ported from tailwind/src/offers.html +
   assets/js/offers.js.

   The template built each ticket with innerHTML and re-ran icons(); here the
   grid maps over the filtered list from useOffers.
*/

const TAB_ICON: Record<CouponTab, typeof CheckCircle2 | null> = {
  All: null,
  Active: CheckCircle2,
  Scheduled: Clock,
  Expired: XCircle,
};

const Offers = () => {
  const {
    coupons,
    tab,
    setTab,
    search,
    setSearch,
    kpis,
    counts,
    visible,
    toggleStatus,
    deleteCoupon,
    updateCoupon,
    createCoupon,
  } = useOffers();
  const { message, visible: toastVisible, showToast } = useToast();

  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Coupon | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  /*
     Mirrors copyCode() — the template toasted on both the success and the
     failure path, so a blocked clipboard still confirms to the user.
  */
  const copyCode = (code: string) => {
    const done = () => showToast(`Copied "${code}"`);
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(code).then(done).catch(done);
    } else {
      done();
    }
  };

  return (
    <>
      {/* Page header */}
      <div className="flex md:items-center justify-between flex-wrap xl:flex-nowrap gap-4 mb-5">
        <div>
          <h2 className="text-xl font-black c-text">Offers &amp; Coupons</h2>
          <p className="text-sm mt-0.5 c-dim">
            Create &amp; manage discount codes and promotions · Austin HQ
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="btn-ghost flex items-center gap-2 px-3.5 py-2 text-sm"
            onClick={() => showToast("Coupons exported")}
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
            Create Coupon
          </button>
        </div>
      </div>
      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="sc-sales reveal">
          <span className="sc-sales-bar" />
          <div className="icon-box ic-gold">
            <Ticket className="w-[18px] h-[18px] c-gold shrink-0" aria-hidden="true" />
          </div>
          <div>
            <div className="text-2xl font-black c-text leading-none">{kpis.active}</div>
            <div className="text-xs font-medium mt-1 c-dim">Active Coupons</div>
          </div>
        </div>
        <div className="sc-sales reveal">
          <span className="sc-sales-bar" />
          <div className="icon-box ic-green">
            <BadgeCheck className="w-[18px] h-[18px] c-green shrink-0" aria-hidden="true" />
          </div>
          <div>
            <div className="text-2xl font-black c-text leading-none">
              {kpis.redeemed.toLocaleString("en-US")}
            </div>
            <div className="text-xs font-medium mt-1 c-dim">Total Redemptions</div>
          </div>
        </div>
        <div className="sc-sales reveal">
          <span className="sc-sales-bar" />
          <div className="icon-box ic-orange">
            <DollarSign className="w-[18px] h-[18px] c-orange shrink-0" aria-hidden="true" />
          </div>
          <div>
            <div className="text-2xl font-black c-text leading-none">
              {moneyWhole(kpis.discount)}
            </div>
            <div className="text-xs font-medium mt-1 c-dim">Discount Given</div>
          </div>
        </div>
        <div className="sc-sales reveal">
          <span className="sc-sales-bar" />
          <div className="icon-box ic-purple">
            <CalendarClock className="w-[18px] h-[18px] c-purple shrink-0" aria-hidden="true" />
          </div>
          <div>
            <div className="text-2xl font-black c-text leading-none">{kpis.scheduled}</div>
            <div className="text-xs font-medium mt-1 c-dim">Scheduled</div>
          </div>
        </div>
      </div>
      {/* Status tabs + search */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {COUPON_TABS.map((name) => {
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
        <div className="relative min-w-[200px]">
          <Search
            className="search-icon absolute left-3 top-1/2 -translate-y-1/2 w-[14px] h-[14px]"
            aria-hidden="true"
          />
          <input
            type="text"
            className="fp-input pl-9 py-2 text-sm"
            placeholder="Search code or title…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
      {/* Coupon grid */}
      {visible.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {visible.map((coupon, index) => {
            const amount =
              coupon.type === "percent" ? `${coupon.value}%` : `$${coupon.value}`;
            const percent = Math.min(
              100,
              Math.round((coupon.used / (coupon.limit || 1)) * 100),
            );
            const TypeIcon = coupon.type === "percent" ? Percent : DollarSign;
            return (
              <div
                key={coupon.code}
                className="coupon reveal"
                // Staggered reveal, capped at 400ms as in couponHtml().
                style={{ animationDelay: `${Math.min(index * 40, 400)}ms` }}
              >
                <div className="coupon-top">
                  <div className="icon-box ic-gold" style={{ width: "48px", height: "48px" }}>
                    <TypeIcon className="w-[20px] h-[20px] c-gold shrink-0" aria-hidden="true" />
                  </div>
                  <div className="flex-1">
                    <div className="coupon-amt">
                      {amount}
                      <span style={{ fontSize: "14px", fontWeight: 700, color: "#A1A1AA" }}>
                        {" "}
                        OFF
                      </span>
                    </div>
                    <div className="text-[12px] c-dim mt-1">{coupon.title}</div>
                  </div>
                  <span className={`badge ${COUPON_STATUS_BADGE[coupon.status]}`}>
                    <span className="dot" />
                    {coupon.status}
                  </span>
                </div>
                <div className="perf" />
                <div className="p-4 pt-5">
                  <div className="code-box mb-3">
                    <span className="code-txt">{coupon.code}</span>
                    <button
                      type="button"
                      className="copy-btn"
                      onClick={() => copyCode(coupon.code)}
                    >
                      <Copy className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
                      Copy
                    </button>
                  </div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] c-dim2 font-bold uppercase tracking-wider">
                      Redeemed
                    </span>
                    <span className="text-[11px] font-bold c-text">
                      {coupon.used} / {coupon.limit}
                    </span>
                  </div>
                  <div className="usage-track mb-3">
                    <div className="usage-fill" style={{ width: `${percent}%` }} />
                  </div>
                  <div className="flex items-center justify-between text-[11px] c-dim mb-3">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-[12px] h-[12px] c-gold shrink-0" aria-hidden="true" />
                      Expires {coupon.expiry}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <TrendingDown className="w-[12px] h-[12px] c-green shrink-0" aria-hidden="true" />
                      {moneyWhole(coupon.discountGiven)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 pt-3 bd-t">
                    <button
                      type="button"
                      className="btn-ghost flex-1 py-1.5 text-xs flex items-center justify-center gap-1.5"
                      onClick={() => setEditTarget(coupon)}
                    >
                      <Pencil className="w-[12px] h-[12px] shrink-0" aria-hidden="true" />
                      Edit
                    </button>
                    {coupon.status === "Expired" ? (
                      <button
                        type="button"
                        className="btn-ghost flex-1 py-1.5 text-xs flex items-center justify-center gap-1.5"
                        onClick={() => setDeleteTarget(coupon.code)}
                      >
                        <Trash2 className="w-[12px] h-[12px] shrink-0" aria-hidden="true" />
                        Delete
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn-gold flex-1 py-1.5 text-xs flex items-center justify-center gap-1.5"
                        onClick={() => {
                          toggleStatus(coupon.code);
                          showToast(
                            coupon.code +
                              (coupon.status === "Active" ? " disabled" : " activated"),
                          );
                        }}
                      >
                        <Power className="w-[12px] h-[12px] shrink-0" aria-hidden="true" />
                        {coupon.status === "Active" ? "Disable" : "Activate"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {/* Empty state */}
      {visible.length === 0 && (
        <div className="text-center py-16">
          <div className="text-[42px] opacity-30 mb-2">🎟️</div>
          <div className="text-sm font-bold c-text">No coupons found</div>
          <div className="text-xs mt-1 c-dim">
            Try a different tab or search — or create a new coupon
          </div>
        </div>
      )}
      <div className="flex items-center justify-between mt-5 text-xs c-dim2">
        <span>
          Showing <span>{visible.length}</span> of <span>{coupons.length}</span> coupons
        </span>
      </div>

      <CreateCouponModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={(input) => {
          createCoupon(input);
          showToast("Coupon created");
        }}
      />
      {/* Keyed so a different coupon remounts the form with its values. */}
      <EditCouponModal
        key={editTarget?.code ?? "edit"}
        coupon={editTarget}
        onClose={() => setEditTarget(null)}
        onSave={(input) => {
          updateCoupon(input);
          showToast(`${input.code} updated`);
        }}
      />
      <DeleteCouponModal
        code={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={(code) => {
          deleteCoupon(code);
          showToast("Coupon deleted");
          setDeleteTarget(null);
        }}
      />
      <Toast message={message} visible={toastVisible} />
    </>
  );
};

export default Offers;

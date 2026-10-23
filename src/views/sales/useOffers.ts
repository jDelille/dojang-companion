import { useCallback, useMemo, useState } from "react";
import type { Coupon, CouponStatus, CouponType } from "../../types/sales";
import { COUPONS } from "../../utils/json/salesData";
import { formatSeedDate } from "../../utils/salesUtils";

/*
   Offers page state — the React equivalent of the `state` object plus
   renderKpis()/filtered() in tailwind/src/assets/js/offers.js.
*/

export type CouponTab = "All" | CouponStatus;

export const COUPON_TABS: CouponTab[] = ["All", "Active", "Scheduled", "Expired"];

export type CreateCouponInput = {
  code: string;
  title: string;
  type: CouponType;
  value: number;
  limit: number;
  expiry: Date | null;
};

export type EditCouponInput = {
  code: string;
  title: string;
  type: CouponType;
  value: number;
  limit: number;
  status: CouponStatus;
};

export function useOffers() {
  const [coupons, setCoupons] = useState<Coupon[]>(COUPONS);
  const [tab, setTab] = useState<CouponTab>("All");
  const [search, setSearch] = useState("");

  const kpis = useMemo(
    () => ({
      active: coupons.filter((coupon) => coupon.status === "Active").length,
      redeemed: coupons.reduce((sum, coupon) => sum + coupon.used, 0),
      discount: coupons.reduce((sum, coupon) => sum + coupon.discountGiven, 0),
      scheduled: coupons.filter((coupon) => coupon.status === "Scheduled").length,
    }),
    [coupons],
  );

  const counts = useMemo(() => {
    const base: Record<CouponTab, number> = {
      All: coupons.length,
      Active: 0,
      Scheduled: 0,
      Expired: 0,
    };
    coupons.forEach((coupon) => {
      base[coupon.status] += 1;
    });
    return base;
  }, [coupons]);

  /* Offers has no sort control — the grid keeps insertion order. */
  const visible = useMemo(() => {
    const query = search.toLowerCase();
    return coupons.filter((coupon) => {
      const matchesQuery =
        !query ||
        coupon.code.toLowerCase().includes(query) ||
        coupon.title.toLowerCase().includes(query);
      const matchesTab = tab === "All" || coupon.status === tab;
      return matchesQuery && matchesTab;
    });
  }, [coupons, search, tab]);

  /** Active ↔ Scheduled; the template used this for both Disable and Activate. */
  const toggleStatus = useCallback((code: string) => {
    setCoupons((prev) =>
      prev.map((coupon) =>
        coupon.code === code
          ? { ...coupon, status: coupon.status === "Active" ? "Scheduled" : "Active" }
          : coupon,
      ),
    );
  }, []);

  const deleteCoupon = useCallback((code: string) => {
    setCoupons((prev) => prev.filter((coupon) => coupon.code !== code));
  }, []);

  /* Empty fields fall back to the existing value, matching saveEdit(). */
  const updateCoupon = useCallback((input: EditCouponInput) => {
    setCoupons((prev) =>
      prev.map((coupon) =>
        coupon.code === input.code
          ? {
              ...coupon,
              title: input.title.trim() || coupon.title,
              type: input.type,
              value: input.value || coupon.value,
              limit: input.limit || coupon.limit,
              status: input.status,
            }
          : coupon,
      ),
    );
  }, []);

  const createCoupon = useCallback((input: CreateCouponInput) => {
    const created: Coupon = {
      code: (input.code.trim() || "NEWCODE").toUpperCase().replace(/\s+/g, ""),
      title: input.title.trim() || "New Offer",
      type: input.type,
      value: input.value || 0,
      used: 0,
      limit: input.limit || 100,
      discountGiven: 0,
      expiry: formatSeedDate(input.expiry, "No expiry"),
      status: "Active",
    };
    setCoupons((prev) => [created, ...prev]);
  }, []);

  return {
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
  };
}

export default useOffers;

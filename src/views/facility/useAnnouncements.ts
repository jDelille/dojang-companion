import { useCallback, useMemo, useState } from "react";
import type {
  Announcement,
  AnnouncementAudience,
  AnnouncementFormValues,
  ScheduleValues,
} from "../../types/announcements";
import {
  ANNOUNCEMENTS,
  AUTHOR,
  NOW,
  NOW_AT,
  PRIORITIES,
  TODAY,
  estReach,
} from "../../utils/json/announcementsData";
import useToast from "../../hooks/useToast";

/*
   Announcements state — ported from tailwind/src/assets/js/announcements.js.
   Owns the status tab, audience/type filters, sort and search, and derives the
   KPIs, per-tab counts and the filtered+sorted list. Every mutation reproduces
   the exact toast() string from the template.
*/

const MON_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export const datePart = (at: string | null | undefined) => String(at || "").split("T")[0];
export const timePart = (at: string | null | undefined) =>
  String(at || "").split("T")[1] || "00:00";

const parseIso = (s: string) => {
  const p = String(s).split("-").map(Number);
  return { y: p[0], m: p[1] - 1, d: p[2] };
};

export function fmtDate(s: string | null | undefined): string {
  if (!s) return "—";
  const p = parseIso(datePart(s));
  if (!p.y) return "—";
  return MON_SHORT[p.m] + " " + p.d + ", " + p.y;
}

export function fmtTime(t: string | null | undefined): string {
  if (!t) return "";
  const p = String(t).split(":");
  let h = parseInt(p[0], 10);
  const ap = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return h + ":" + p[1] + " " + ap;
}

export const fmtDateTime = (at: string | null | undefined) =>
  at ? fmtDate(at) + " · " + fmtTime(timePart(at)) : "—";

export function daysBetween(a: string, b: string): number {
  const pa = parseIso(datePart(a));
  const pb = parseIso(datePart(b));
  return Math.round(
    (new Date(pb.y, pb.m, pb.d).getTime() - new Date(pa.y, pa.m, pa.d).getTime()) / 86400000,
  );
}

export const toMin = (t: string) => {
  const p = String(t).split(":");
  return Number(p[0]) * 60 + Number(p[1]);
};

/** Relative label built from a real timestamp rather than a stored string. */
export function relTime(at: string | null | undefined): string {
  if (!at) return "—";
  const d = daysBetween(at, TODAY);
  if (d === 0) {
    const mins = toMin(NOW) - toMin(timePart(at));
    if (mins < 1) return "Just now";
    if (mins < 60) return mins + " min ago";
    return Math.floor(mins / 60) + " hr ago";
  }
  if (d === 1) return "Yesterday";
  if (d < 7) return d + " days ago";
  if (d < 30)
    return Math.floor(d / 7) + " week" + (Math.floor(d / 7) === 1 ? "" : "s") + " ago";
  if (d < 365)
    return Math.floor(d / 30) + " month" + (Math.floor(d / 30) === 1 ? "" : "s") + " ago";
  return fmtDate(at);
}

export function whenLabel(a: Announcement): string {
  if (a.status === "Scheduled") return "Starts " + fmtDate(a.publishAt);
  if (a.status === "Draft") return "Draft · edited " + relTime(a.createdAt);
  return relTime(a.publishAt || a.createdAt);
}

type ViewState = {
  tab: string;
  audience: string;
  type: string;
  sort: string;
  search: string;
};

export function useAnnouncements() {
  const { message, visible, showToast } = useToast();

  const [anns, setAnns] = useState<Announcement[]>(ANNOUNCEMENTS);
  const [state, setState] = useState<ViewState>({
    tab: "All",
    audience: "All",
    type: "All",
    sort: "recent",
    search: "",
  });

  const nextId = useCallback(
    () => anns.reduce((max, a) => Math.max(max, a.id), 0) + 1,
    [anns],
  );

  const find = useCallback(
    (id: number) => anns.find((a) => a.id === id) ?? null,
    [anns],
  );

  const setTab = useCallback((tab: string) => setState((s) => ({ ...s, tab })), []);
  const setAudience = useCallback(
    (audience: string) => setState((s) => ({ ...s, audience })),
    [],
  );
  const setType = useCallback((type: string) => setState((s) => ({ ...s, type })), []);
  const setSort = useCallback((sort: string) => setState((s) => ({ ...s, sort })), []);
  const setSearch = useCallback((search: string) => setState((s) => ({ ...s, search })), []);

  /* ---------- Derived ---------- */

  const kpis = useMemo(
    () => ({
      total: anns.filter((a) => a.status === "Active" || a.status === "Expired").length,
      active: anns.filter((a) => a.status === "Active").length,
      reach: anns.reduce((s, a) => s + a.reach, 0).toLocaleString("en-US"),
      scheduled: anns.filter((a) => a.status === "Scheduled").length,
    }),
    [anns],
  );

  const counts = useMemo(
    () => ({
      All: anns.length,
      Active: anns.filter((a) => a.status === "Active").length,
      Scheduled: anns.filter((a) => a.status === "Scheduled").length,
      Draft: anns.filter((a) => a.status === "Draft").length,
      Expired: anns.filter((a) => a.status === "Expired").length,
    }),
    [anns],
  );

  const filtered = useMemo(() => {
    const q = state.search.trim().toLowerCase();
    const matches = (a: Announcement) => {
      const mq =
        !q ||
        a.title.toLowerCase().includes(q) ||
        a.body.toLowerCase().includes(q) ||
        a.type.toLowerCase().includes(q) ||
        a.audience.toLowerCase().includes(q);
      const mt = state.tab === "All" || a.status === state.tab;
      const ma = state.audience === "All" || a.audience === state.audience;
      const my = state.type === "All" || a.type === state.type;
      return mq && mt && ma && my;
    };

    const keyFns: Record<string, (a: Announcement) => string | number> = {
      recent: (a) => a.publishAt || a.createdAt,
      reach: (a) => a.reach,
      priority: (a) => PRIORITIES.indexOf(a.priority),
      title: (a) => a.title.toLowerCase(),
    };
    const key = keyFns[state.sort] || ((a: Announcement) => a.createdAt);
    const desc =
      state.sort === "recent" || state.sort === "reach" || state.sort === "priority";

    return anns.filter(matches).sort((x, y) => {
      if (x.pinned !== y.pinned) return x.pinned ? -1 : 1;
      const kx = key(x);
      const ky = key(y);
      if (kx < ky) return desc ? 1 : -1;
      if (kx > ky) return desc ? -1 : 1;
      return y.id - x.id;
    });
  }, [anns, state]);

  /* ---------- Mutations ---------- */

  const saveForm = useCallback(
    (values: AnnouncementFormValues, editId: number | null, asDraft: boolean) => {
      if (editId != null) {
        setAnns((prev) =>
          prev.map((a) => {
            if (a.id !== editId) return a;
            const next: Announcement = { ...a, ...values };
            if (asDraft) {
              next.status = "Draft";
              next.publishAt = null;
              next.pinned = false;
            } else if (next.status === "Active") {
              next.reach = estReach(next.audience);
            }
            if (next.status !== "Active") next.pinned = false;
            return next;
          }),
        );
        showToast("“" + values.title + "” " + (asDraft ? "saved as draft" : "updated"));
      } else {
        const created: Announcement = {
          id: nextId(),
          ...values,
          pinned: asDraft ? false : values.pinned,
          status: asDraft ? "Draft" : "Active",
          publishAt: asDraft ? null : NOW_AT,
          reach: asDraft ? 0 : estReach(values.audience),
          createdAt: NOW_AT,
          author: AUTHOR,
        };
        setAnns((prev) => [created, ...prev]);
        showToast(
          asDraft
            ? "Draft saved"
            : "“" + created.title + "” published to " + created.audience.toLowerCase(),
        );
      }
    },
    [nextId, showToast],
  );

  const submitSchedule = useCallback(
    (id: number, values: ScheduleValues) => {
      const a = find(id);
      const publishAt = values.date + "T" + values.time;
      setAnns((prev) =>
        prev.map((x) =>
          x.id === id
            ? {
                ...x,
                publishAt,
                expireAt: values.expireAt || null,
                status: "Scheduled" as const,
                reach: 0,
              }
            : x,
        ),
      );
      if (a)
        showToast(
          "“" + a.title + "” scheduled for " + fmtDate(publishAt) + " at " +
            fmtTime(timePart(publishAt)),
        );
    },
    [find, showToast],
  );

  const confirmPublish = useCallback(
    (id: number) => {
      const a = find(id);
      const reach = a ? estReach(a.audience) : 0;
      setAnns((prev) =>
        prev.map((x) =>
          x.id === id
            ? { ...x, status: "Active" as const, publishAt: NOW_AT, reach: estReach(x.audience) }
            : x,
        ),
      );
      if (a)
        showToast("“" + a.title + "” published to ~" + reach.toLocaleString("en-US") + " people");
    },
    [find, showToast],
  );

  const confirmUnpublish = useCallback(
    (id: number) => {
      const a = find(id);
      setAnns((prev) =>
        prev.map((x) =>
          x.id === id
            ? { ...x, status: "Draft" as const, publishAt: null, pinned: false }
            : x,
        ),
      );
      if (a) showToast("“" + a.title + "” unpublished and moved to Drafts");
    },
    [find, showToast],
  );

  const confirmArchive = useCallback(
    (id: number) => {
      const a = find(id);
      setAnns((prev) =>
        prev.map((x) =>
          x.id === id
            ? { ...x, status: "Expired" as const, pinned: false, expireAt: TODAY }
            : x,
        ),
      );
      if (a) showToast("“" + a.title + "” archived");
    },
    [find, showToast],
  );

  const republish = useCallback(
    (id: number) => {
      const a = find(id);
      setAnns((prev) =>
        prev.map((x) =>
          x.id === id
            ? {
                ...x,
                status: "Active" as const,
                publishAt: NOW_AT,
                expireAt: null,
                reach: estReach(x.audience),
              }
            : x,
        ),
      );
      if (a) showToast("“" + a.title + "” republished");
    },
    [find, showToast],
  );

  const duplicate = useCallback(
    (id: number) => {
      const src = find(id);
      if (!src) return;
      const copy: Announcement = {
        ...src,
        id: nextId(),
        title: src.title + " (copy)",
        status: "Draft",
        publishAt: null,
        reach: 0,
        pinned: false,
        createdAt: NOW_AT,
        channels: src.channels.slice(),
      };
      setAnns((prev) => [copy, ...prev]);
      showToast("“" + src.title + "” duplicated as a draft");
    },
    [find, nextId, showToast],
  );

  const togglePin = useCallback(
    (id: number) => {
      const a = find(id);
      if (!a) return;
      if (!a.pinned && a.status !== "Active") {
        showToast("Publish “" + a.title + "” before pinning it");
        return;
      }
      const nextPinned = !a.pinned;
      setAnns((prev) => prev.map((x) => (x.id === id ? { ...x, pinned: nextPinned } : x)));
      showToast(
        nextPinned ? "“" + a.title + "” pinned to top" : "“" + a.title + "” unpinned",
      );
    },
    [find, showToast],
  );

  const confirmDelete = useCallback(
    (id: number) => {
      const a = find(id);
      const title = a?.title ?? "Announcement";
      setAnns((prev) => prev.filter((x) => x.id !== id));
      showToast("“" + title + "” deleted");
    },
    [find, showToast],
  );

  const rowsForScope = useCallback(
    (scope: string): Announcement[] => {
      if (scope === "all") return anns.slice();
      if (scope === "active") return anns.filter((a) => a.status === "Active");
      return filtered;
    },
    [anns, filtered],
  );

  const exportAnns = useCallback(
    (rows: Announcement[], format: string) => {
      if (!rows.length) {
        showToast("Nothing to export");
        return;
      }
      showToast(
        rows.length +
          " announcement" +
          (rows.length === 1 ? "" : "s") +
          " exported as " +
          format.toUpperCase(),
      );
    },
    [showToast],
  );

  const resetFilters = useCallback(() => {
    setState({ tab: "All", audience: "All", type: "All", sort: "recent", search: "" });
    showToast("Filters reset");
  }, [showToast]);

  const showArchived = useCallback(() => {
    setState((s) => ({ ...s, tab: "Expired" }));
    showToast("Showing archived announcements");
  }, [showToast]);

  return {
    anns,
    state,
    setTab,
    setAudience,
    setType,
    setSort,
    setSearch,
    kpis,
    counts,
    filtered,
    find,
    estReachFor: (aud: AnnouncementAudience) => estReach(aud),
    saveForm,
    submitSchedule,
    confirmPublish,
    confirmUnpublish,
    confirmArchive,
    republish,
    duplicate,
    togglePin,
    confirmDelete,
    rowsForScope,
    exportAnns,
    resetFilters,
    showArchived,
    toast: { message, visible },
  };
}

export default useAnnouncements;

import { useCallback, useMemo, useState } from "react";
import type {
  Branch,
  BranchExportFormat,
  BranchExportScope,
  BranchFormValues,
  BranchSettingsValues,
  BranchSortKey,
  BranchStatus,
  BranchTransferValues,
  BranchView,
} from "../../types/branches";
import {
  BRANCHES,
  BRANCH_AV,
  BRANCH_TODAY,
  EX_COLS,
  MANAGERS,
  capPct,
  hoursOf,
  mgrName,
} from "../../utils/json/branchesData";
import { moneyWhole, usd } from "../../utils/formatUtils";
import useToast from "../../hooks/useToast";

/*
   Branches state — ported from tailwind/src/assets/js/branches.js. Owns the
   status tab, city filter, search, sort key + direction, grid/list view and
   the active ("current") branch, and derives the KPIs, city list and the
   filtered + sorted list. Every mutation mirrors its JS counterpart and raises
   the same toast string. CSV / JSON downloads and window.print() reproduce the
   template's download()/printBranches() helpers.
*/

const NBS = "en-US";
const num = (n: number) => n.toLocaleString(NBS);

/** "AB" — the initials() helper. */
export const initials = (name: string): string =>
  String(name || "")
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

/** avClass() — hashes a name's length onto the AV palette. */
export const avClass = (s: string): string =>
  BRANCH_AV[String(s || "").length % BRANCH_AV.length];

const mgr = (id: string | null) => MANAGERS.find((m) => m.id === id) ?? null;

/** download() — Blob + object URL + a programmatic anchor click. */
function download(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export type BranchKpis = {
  total: number;
  members: string;
  revenue: string;
  top: string;
};

export type PrintTarget = { ids: number[] } | null;

export function useBranches() {
  const { message, visible, showToast } = useToast();

  const [branches, setBranches] = useState<Branch[]>(BRANCHES);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"All" | BranchStatus>("All");
  const [city, setCity] = useState("All");
  const [sort, setSort] = useState<BranchSortKey>("name");
  const [dir, setDir] = useState<"asc" | "desc">("asc");
  const [view, setView] = useState<BranchView>("grid");
  const [current, setCurrent] = useState(1);

  /** Branches the print sheet should render, or null when idle. */
  const [printTarget, setPrintTarget] = useState<PrintTarget>(null);

  const find = useCallback(
    (id: number) => branches.find((b) => b.id === id) ?? null,
    [branches],
  );

  /* ---------- Derived ---------- */

  const cities = useMemo(
    () => Array.from(new Set(branches.map((b) => b.city))).sort(),
    [branches],
  );

  const kpis: BranchKpis = useMemo(() => {
    const members = branches.reduce((s, b) => s + b.members, 0);
    const revenue = branches.reduce((s, b) => s + b.revenue, 0);
    const top = branches.slice().sort((a, b) => b.revenue - a.revenue)[0];
    return {
      total: branches.length,
      members: num(members),
      revenue: usd(revenue),
      top: top && top.revenue ? top.city : "—",
    };
  }, [branches]);

  const tabCounts = useMemo(
    () => ({
      All: branches.length,
      Active: branches.filter((b) => b.status === "Active").length,
      "Opening Soon": branches.filter((b) => b.status === "Opening Soon").length,
      "Temporarily Closed": branches.filter((b) => b.status === "Temporarily Closed").length,
    }),
    [branches],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const matches = (b: Branch) => {
      const mq =
        !q ||
        b.name.toLowerCase().includes(q) ||
        b.city.toLowerCase().includes(q) ||
        mgrName(b).toLowerCase().includes(q) ||
        b.address.toLowerCase().includes(q);
      const mt = tab === "All" || b.status === tab;
      const mc = city === "All" || b.city === city;
      return mq && mt && mc;
    };

    const d = dir === "asc" ? 1 : -1;
    const keyOf = (b: Branch): string | number => {
      switch (sort) {
        case "members":
          return b.members;
        case "revenue":
          return b.revenue;
        case "capacity":
          return capPct(b);
        case "rating":
          return b.rating;
        case "name":
        default:
          return b.name.toLowerCase();
      }
    };

    return branches
      .filter(matches)
      .slice()
      .sort((a, b) => {
        const ka = keyOf(a);
        const kb = keyOf(b);
        if (ka < kb) return -1 * d;
        if (ka > kb) return 1 * d;
        return a.id - b.id;
      });
  }, [branches, search, tab, city, sort, dir]);

  /* ---------- View helpers ---------- */

  const toggleSort = useCallback((k: BranchSortKey) => {
    setSort((prevSort) => {
      if (prevSort === k) {
        setDir((prevDir) => (prevDir === "asc" ? "desc" : "asc"));
        return prevSort;
      }
      setDir("asc");
      return k;
    });
  }, []);

  const setSortField = useCallback((k: BranchSortKey) => {
    setSort(k);
    setDir("asc");
  }, []);

  const resetFilters = useCallback(() => {
    setSearch("");
    setCity("All");
    setTab("All");
    showToast("Filters reset");
  }, [showToast]);

  /* ---------- Switch active branch ---------- */

  const switchTo = useCallback(
    (id: number) => {
      const b = find(id);
      if (!b) return;
      if (b.status !== "Active") {
        showToast(b.name + " is not trading yet — cannot switch");
        return;
      }
      setCurrent(id);
      showToast("Switched to " + b.name);
    },
    [find, showToast],
  );

  /* ---------- Add / Edit ---------- */

  const saveBranch = useCallback(
    (values: BranchFormValues, editId: number | null) => {
      const data = {
        name: values.name.trim(),
        city: values.city.trim(),
        address: values.address.trim(),
        managerId: values.managerId || null,
        phone: values.phone.trim(),
        capacity: Number(values.capacity) || 0,
        open: values.open || "05:00",
        close: values.close || "23:00",
        status: values.status,
      };
      const wantHq = values.hq;

      setBranches((prev) => {
        let next: Branch[];
        if (editId != null) {
          const wasHq = prev.find((b) => b.id === editId)?.hq ?? false;
          /* Setting a non-HQ branch as HQ clears the flag everywhere else. */
          const claimHq = wantHq && !wasHq;
          next = prev.map((b) => {
            if (b.id === editId) {
              return { ...b, ...data, hq: wantHq };
            }
            return claimHq ? { ...b, hq: false } : b;
          });
        } else {
          const newBranch: Branch = {
            id: prev.reduce((max, b) => Math.max(max, b.id), 0) + 1,
            ...data,
            members: 0,
            staff: 0,
            revenue: 0,
            rating: 0,
            hq: false,
            opened: data.status === "Active" ? BRANCH_TODAY : null,
            openingDate: null,
            amenities: ["Parking", "Locker Rooms"],
            settings: { signups: true, access247: false, publicVisible: true },
          };
          if (wantHq) {
            next = prev.map((b) => ({ ...b, hq: false }));
            newBranch.hq = true;
          } else {
            next = prev.slice();
          }
          next.push(newBranch);
        }
        /* Never leave the org without a headquarters. */
        if (!next.some((b) => b.hq) && next.length) {
          next = next.map((b, i) => (i === 0 ? { ...b, hq: true } : b));
        }
        return next;
      });

      const editedName = editId != null ? find(editId)?.name ?? data.name : data.name;
      showToast(editId != null ? editedName + " updated" : data.name + " added");
    },
    [find, showToast],
  );

  /* ---------- Assign manager ---------- */

  const assignManager = useCallback(
    (branchId: number, managerId: string) => {
      const b = find(branchId);
      if (!b) return;
      const m = mgr(managerId);
      if (!m) return;
      const prev = branches.find((x) => x.managerId === managerId && x.id !== branchId) ?? null;

      setBranches((all) =>
        all.map((x) => {
          if (x.id === branchId) return { ...x, managerId, phone: m.phone };
          if (prev && x.id === prev.id) return { ...x, managerId: null };
          return x;
        }),
      );
      showToast(
        m.name +
          " now manages " +
          b.name +
          (prev ? " (released from " + prev.city + ")" : ""),
      );
    },
    [branches, find, showToast],
  );

  /* ---------- Settings ---------- */

  const saveSettings = useCallback(
    (branchId: number, values: BranchSettingsValues) => {
      const b = find(branchId);
      if (!b) return;
      setBranches((all) =>
        all.map((x) =>
          x.id === branchId
            ? {
                ...x,
                capacity: Number(values.capacity),
                open: values.open || x.open,
                close: values.close || x.close,
                amenities: values.amenities.slice(),
                settings: {
                  signups: values.signups,
                  access247: values.access247,
                  publicVisible: values.publicVisible,
                },
              }
            : x,
        ),
      );
      showToast(b.name + " settings saved");
    },
    [find, showToast],
  );

  /* ---------- Transfer members ---------- */

  const transferMembers = useCallback(
    (values: BranchTransferValues) => {
      const from = find(values.fromId);
      const to = find(values.toId);
      if (!from || !to) return;
      const n = Number(values.count);
      /* Move members and the revenue they represent, so KPIs stay honest. */
      const perMember = from.members ? Math.round(from.revenue / from.members) : 0;
      const moved = perMember * n;

      setBranches((all) =>
        all.map((x) => {
          if (x.id === from.id) {
            return { ...x, members: x.members - n, revenue: Math.max(0, x.revenue - moved) };
          }
          if (x.id === to.id) {
            return { ...x, members: x.members + n, revenue: x.revenue + moved };
          }
          return x;
        }),
      );
      showToast(num(n) + " members moved to " + to.name + " · " + values.reason);
    },
    [find, showToast],
  );

  /* ---------- Change status ---------- */

  const changeStatus = useCallback(
    (branchId: number, next: BranchStatus): boolean => {
      const b = find(branchId);
      if (!b) return true;
      if (next === b.status) return true;
      if (b.hq && next !== "Active") {
        showToast("The headquarters must stay active — set another branch as HQ first");
        return false;
      }
      const was = b.status;

      setBranches((all) =>
        all.map((x) => {
          if (x.id !== branchId) return x;
          const updated: Branch = { ...x, status: next };
          if (next === "Active" && !x.opened) {
            updated.opened = BRANCH_TODAY;
            updated.openingDate = null;
          }
          return updated;
        }),
      );

      /* The active branch must be a trading one. */
      if (next !== "Active" && current === b.id) {
        const fallback = branches.find((x) => x.status === "Active" && x.id !== b.id);
        if (fallback) setCurrent(fallback.id);
      }
      showToast(b.name + ": " + was + " → " + next);
      return true;
    },
    [branches, current, find, showToast],
  );

  /* ---------- Delete ---------- */

  const deleteBranch = useCallback(
    (branchId: number) => {
      const b = find(branchId);
      if (!b) return;
      /* Absorb members + revenue + staff into the HQ rather than lose them. */
      const hq = branches.find((x) => x.hq && x.id !== b.id) ?? null;

      setBranches((all) => {
        let next = all;
        if (b.members > 0 && hq) {
          next = next.map((x) =>
            x.id === hq.id
              ? {
                  ...x,
                  members: x.members + b.members,
                  revenue: x.revenue + b.revenue,
                  staff: x.staff + b.staff,
                }
              : x,
          );
        }
        return next.filter((x) => x.id !== b.id);
      });

      if (current === b.id) {
        const fallback = branches.find((x) => x.status === "Active" && x.id !== b.id);
        if (fallback) setCurrent(fallback.id);
      }
      showToast(b.name + " deleted");
    },
    [branches, current, find, showToast],
  );

  /* ---------- Export ---------- */

  const exportBranches = useCallback(
    (format: BranchExportFormat, scope: BranchExportScope) => {
      const rows = scope === "all" ? branches.slice() : filtered;
      if (!rows.length) {
        showToast("Nothing to export");
        return;
      }
      if (format === "print") {
        setPrintTarget({ ids: rows.map((b) => b.id) });
        return;
      }

      if (format === "csv") {
        const cell = (v: string | number) => {
          const s = String(v == null ? "" : v);
          return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
        };
        const csv = [EX_COLS.map((c) => cell(c[0])).join(",")]
          .concat(rows.map((b) => EX_COLS.map((c) => cell(c[1](b))).join(",")))
          .join("\r\n");
        /* Explicit BOM so Excel reads the UTF-8 names correctly. */
        download("branches-" + BRANCH_TODAY + ".csv", "﻿" + csv, "text/csv;charset=utf-8;");
      } else {
        const data = rows.map((b) => ({
          name: b.name,
          city: b.city,
          address: b.address,
          status: b.status,
          headquarters: b.hq,
          manager: mgrName(b),
          phone: b.phone,
          members: b.members,
          capacity: b.capacity,
          capacityPct: capPct(b),
          staff: b.staff,
          monthlyRevenue: b.revenue,
          rating: b.rating || null,
          hours: hoursOf(b),
          amenities: b.amenities,
          opened: b.opened,
          settings: b.settings,
        }));
        download(
          "branches-" + BRANCH_TODAY + ".json",
          JSON.stringify(
            { organisation: "Dreams GYM", exportedOn: BRANCH_TODAY, count: data.length, branches: data },
            null,
            2,
          ),
          "application/json",
        );
      }
      showToast(
        rows.length + " branch" + (rows.length === 1 ? "" : "es") + " exported as " + format.toUpperCase(),
      );
    },
    [branches, filtered, showToast],
  );

  /* ---------- Print ---------- */

  /** Fill the hidden print sheet, then hand off to window.print(). */
  const printBranches = useCallback(
    (ids: number[]) => {
      const list = ids.map((id) => find(id)).filter((b): b is Branch => Boolean(b));
      if (!list.length) {
        showToast("Nothing to print");
        return;
      }
      setPrintTarget({ ids: list.map((b) => b.id) });
    },
    [find, showToast],
  );

  /** Called by the page after the print sheet has rendered. */
  const runPrint = useCallback(
    (ids: number[]) => {
      const list = ids.map((id) => find(id)).filter((b): b is Branch => Boolean(b));
      window.print();
      setPrintTarget(null);
      showToast(
        list.length === 1
          ? list[0].name + " sent to printer"
          : list.length + " branches sent to printer",
      );
    },
    [find, showToast],
  );

  return {
    branches,
    filtered,
    cities,
    kpis,
    tabCounts,
    search,
    setSearch,
    tab,
    setTab,
    city,
    setCity,
    sort,
    dir,
    setSortField,
    toggleSort,
    view,
    setView,
    current,
    printTarget,
    find,
    resetFilters,
    switchTo,
    saveBranch,
    assignManager,
    saveSettings,
    transferMembers,
    changeStatus,
    deleteBranch,
    exportBranches,
    printBranches,
    runPrint,
    toast: { message, visible },
  };
}

export { moneyWhole, usd };
export default useBranches;

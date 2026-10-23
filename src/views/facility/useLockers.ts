import { useCallback, useMemo, useState } from "react";
import type {
  AssignValues,
  ExportFormat,
  Locker,
  LockerFormValues,
  LockerStatus,
  MaintenanceValues,
  SortDir,
  SortKey,
} from "../../types/lockers";
import { LOCKERS, MEMBERS, STATUSES, TODAY, ZONES } from "../../utils/json/lockersData";
import useToast from "../../hooks/useToast";

/*
   Locker Management state — ported from tailwind/src/assets/js/lockers.js. Owns
   the status / zone / size / search filters, sort, map/list view, pagination,
   multi-select and every mutation. Derives the KPIs, tab counts, the filtered +
   sorted list and the current page slice.
*/

/* ---------- Date helpers ---------- */
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const fmtDate = (iso: string | null) => {
  if (!iso) return "—";
  const p = String(iso).split("-");
  if (p.length !== 3) return iso;
  return MONTHS[Number(p[1]) - 1] + " " + p[2] + ", " + p[0];
};

export const toIso = (d: Date) =>
  d.getFullYear() +
  "-" +
  String(d.getMonth() + 1).padStart(2, "0") +
  "-" +
  String(d.getDate()).padStart(2, "0");

export const addMonths = (iso: string, n: number) => {
  const d = new Date(iso + "T00:00:00");
  const day = d.getDate();
  d.setMonth(d.getMonth() + n);
  if (d.getDate() < day) d.setDate(0);
  return toIso(d);
};

export const addDays = (iso: string, n: number) => {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + n);
  return toIso(d);
};

/** Parses an ISO seed date into a Date for the pickers, or a fallback. */
export const parseIso = (iso: string | null, fallback: Date): Date => {
  if (!iso) return fallback;
  const d = new Date(iso + "T00:00:00");
  return Number.isNaN(d.getTime()) ? fallback : d;
};

export const isOverdue = (l: Locker) =>
  l.status === "Occupied" && !!l.expiry && l.expiry < TODAY;

export const code = (l: Locker) =>
  "LK-" + l.zone.replace(/[^A-Za-z]/g, "").slice(0, 3).toUpperCase() + "-" + l.num;

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

const usd = (n: number) => "$" + n.toLocaleString("en-US");

export function useLockers() {
  const { message, visible, showToast } = useToast();

  const [lockers, setLockers] = useState<Locker[]>(LOCKERS);

  const [status, setStatusState] = useState("All");
  const [zone, setZoneState] = useState("All");
  const [search, setSearch] = useState("");
  const [size, setSize] = useState("All");
  const [sort, setSort] = useState<SortKey>("num");
  const [dir, setDir] = useState<SortDir>("asc");
  const [view, setView] = useState<"map" | "list">("map");
  const [page, setPage] = useState(1);
  const [per, setPer] = useState(48);
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const find = useCallback(
    (id: number) => lockers.find((l) => l.id === id) ?? null,
    [lockers],
  );

  /* ---------- KPIs + tab counts ---------- */
  const kpis = useMemo(() => {
    const total = lockers.length;
    const avail = lockers.filter((l) => l.status === "Available").length;
    const busy = lockers.filter((l) => l.status === "Occupied" || l.status === "Reserved").length;
    return {
      total,
      available: avail,
      occupancy: total ? Math.round((busy / total) * 100) + "%" : "0%",
      maintenance: lockers.filter((l) => l.status === "Maintenance").length,
    };
  }, [lockers]);

  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = { All: lockers.length };
    STATUSES.forEach((s) => {
      counts[s] = lockers.filter((l) => l.status === s).length;
    });
    return counts;
  }, [lockers]);

  /* ---------- Filter + sort ---------- */
  const matches = useCallback(
    (l: Locker) => {
      const q = search.trim().toLowerCase();
      const mq =
        !q ||
        l.num.toLowerCase().includes(q) ||
        code(l).toLowerCase().includes(q) ||
        (l.member || "").toLowerCase().includes(q) ||
        (l.memberId || "").toLowerCase().includes(q);
      const ms = status === "All" || l.status === status;
      const mz = zone === "All" || l.zone === zone;
      const msz = size === "All" || l.size === size;
      return mq && ms && mz && msz;
    },
    [search, status, zone, size],
  );

  const filtered = useMemo(() => {
    const list = lockers.filter(matches);
    const d = dir === "asc" ? 1 : -1;
    const keyFns: Record<SortKey, (l: Locker) => number | string> = {
      num: (l) => l.id,
      status: (l) => STATUSES.indexOf(l.status),
      zone: (l) => ZONES.indexOf(l.zone) * 1000 + l.id,
      member: (l) => (l.member || "~").toLowerCase(),
      expiry: (l) => l.expiry || "9999-99-99",
    };
    const key = keyFns[sort] ?? ((l: Locker) => l.id);
    return [...list].sort((a, b) => {
      const ka = key(a);
      const kb = key(b);
      if (ka < kb) return -1 * d;
      if (ka > kb) return 1 * d;
      return a.id - b.id;
    });
  }, [lockers, matches, sort, dir]);

  const pages = Math.max(1, Math.ceil(filtered.length / per));
  const currentPage = Math.min(Math.max(1, page), pages);

  const pageRows = useMemo(() => {
    const start = (currentPage - 1) * per;
    return filtered.slice(start, start + per);
  }, [filtered, currentPage, per]);

  const pageInfo = useMemo(() => {
    const shown = filtered.length;
    const start = shown ? (currentPage - 1) * per + 1 : 0;
    return {
      from: start,
      to: Math.min(start + per - 1, shown),
      total: shown,
      pages,
    };
  }, [filtered.length, currentPage, per, pages]);

  /* ---------- Filter setters ---------- */
  const setStatus = useCallback((v: string) => {
    setStatusState(v);
    setPage(1);
  }, []);
  const setZone = useCallback((v: string) => {
    setZoneState(v);
    setPage(1);
  }, []);
  const changeSearch = useCallback((v: string) => {
    setSearch(v);
    setPage(1);
  }, []);
  const changeSize = useCallback((v: string) => {
    setSize(v);
    setPage(1);
  }, []);
  /* Picking a new sort field resets direction, matching the header behaviour. */
  const changeSort = useCallback((v: SortKey) => {
    setSort(v);
    setDir("asc");
    setPage(1);
  }, []);
  const toggleSort = useCallback((k: SortKey) => {
    setSort((prevSort) => {
      if (prevSort === k) {
        setDir((prevDir) => (prevDir === "asc" ? "desc" : "asc"));
      } else {
        setDir("asc");
      }
      return k;
    });
  }, []);
  const changePer = useCallback((n: number) => {
    setPer(n);
    setPage(1);
  }, []);

  const resetFilters = useCallback(() => {
    setSearch("");
    setSize("All");
    setStatusState("All");
    setZoneState("All");
    setPage(1);
    showToast("Filters reset");
  }, [showToast]);

  /* ---------- Selection ---------- */
  const clearSelection = useCallback(() => setSelected(new Set()), []);

  const toggleSelect = useCallback((id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleSelectMode = useCallback(() => {
    setSelectMode((on) => {
      const next = !on;
      if (!next) setSelected(new Set());
      else showToast("Select mode on — click lockers to select");
      return next;
    });
  }, [showToast]);

  const toggleSelectAll = useCallback(
    (checked: boolean, ids: number[]) => {
      setSelected((prev) => {
        const next = new Set(prev);
        ids.forEach((id) => {
          if (checked) next.add(id);
          else next.delete(id);
        });
        return next;
      });
    },
    [],
  );

  const selectedIds = useCallback(() => Array.from(selected), [selected]);

  /* ---------- Mutations ---------- */

  const saveLocker = useCallback(
    (values: LockerFormValues, editId: number | null) => {
      const start = Number(values.start);
      const zoneV = values.zone;
      const sizeV = values.size;
      const keyV = values.key;
      const depositV = Number(values.deposit);
      const notesV = values.notes.trim();

      if (editId != null) {
        setLockers((prev) =>
          prev.map((l) => {
            if (l.id !== editId) return l;
            const prevStatus = l.status;
            const updated: Locker = {
              ...l,
              num: String(start).padStart(2, "0"),
              zone: zoneV,
              size: sizeV,
              key: keyV,
              deposit: depositV,
              notes: notesV,
              status: values.status,
            };
            if (updated.status === "Available" && prevStatus !== "Available") {
              updated.member = null;
              updated.memberId = null;
              updated.since = null;
              updated.expiry = null;
            }
            return updated;
          }),
        );
        showToast("Locker " + String(start).padStart(2, "0") + " updated");
      } else {
        const count = Number(values.count);
        setLockers((prev) => {
          let maxId = prev.reduce((m, l) => Math.max(m, l.id), 0);
          const created: Locker[] = [];
          for (let i = 0; i < count; i++) {
            const n = start + i;
            created.push({
              id: ++maxId,
              num: String(n).padStart(2, "0"),
              zone: zoneV,
              size: sizeV,
              status: "Available",
              key: keyV,
              deposit: depositV,
              member: null,
              memberId: null,
              since: null,
              expiry: null,
              notes: notesV,
              history: [],
            });
          }
          return [...prev, ...created];
        });
        showToast(count + " locker" + (count > 1 ? "s" : "") + " added to " + zoneV + " Zone");
      }
    },
    [showToast],
  );

  const assignLockers = useCallback(
    (ids: number[], values: AssignValues) => {
      const name = values.member.trim();
      const known = MEMBERS.find(
        (m) => m.name.toLowerCase() === name.toLowerCase() || m.id.toLowerCase() === name.toLowerCase(),
      );
      const memberId = known ? known.id : values.memberId || "FP-NEW";
      const memberName = known ? known.name : name;
      const reserve = values.reserve;
      const from = values.from ? toIso(values.from) : TODAY;
      const until = values.until ? toIso(values.until) : TODAY;

      const list = ids.map((id) => find(id)).filter((l): l is Locker => !!l);
      setLockers((prev) =>
        prev.map((l) =>
          ids.includes(l.id)
            ? {
                ...l,
                status: (reserve ? "Reserved" : "Occupied") as LockerStatus,
                member: memberName,
                memberId,
                since: from,
                expiry: until,
                history: [
                  {
                    date: TODAY,
                    action: reserve ? "Reserved" : "Assigned",
                    note: memberName + " · until " + fmtDate(until),
                    tech: "—",
                  },
                  ...l.history,
                ],
              }
            : l,
        ),
      );
      clearSelection();
      showToast(
        list.length === 1
          ? "Locker " + list[0].num + " " + (reserve ? "reserved for " : "assigned to ") + memberName
          : list.length + " lockers " + (reserve ? "reserved for " : "assigned to ") + memberName,
      );
    },
    [find, clearSelection, showToast],
  );

  const releaseLockers = useCallback(
    (ids: number[], reason: string, refund: boolean) => {
      const list = ids.map((id) => find(id)).filter((l): l is Locker => !!l);
      const total = list.reduce((t, l) => t + l.deposit, 0);
      setLockers((prev) =>
        prev.map((l) =>
          ids.includes(l.id)
            ? {
                ...l,
                history: [
                  {
                    date: TODAY,
                    action: "Released",
                    note:
                      reason +
                      (refund ? " · deposit refunded " + usd(l.deposit) : " · deposit retained"),
                    tech: "—",
                  },
                  ...l.history,
                ],
                status: "Available" as LockerStatus,
                member: null,
                memberId: null,
                since: null,
                expiry: null,
              }
            : l,
        ),
      );
      clearSelection();
      showToast(
        (list.length === 1 ? "Locker " + list[0].num + " released" : list.length + " lockers released") +
          (refund ? " · " + usd(total) + " refunded" : ""),
      );
    },
    [find, clearSelection, showToast],
  );

  const logMaintenance = useCallback(
    (ids: number[], values: MaintenanceValues) => {
      const type = values.type;
      const tech = values.tech;
      const note = values.note.trim();
      const due = values.due ? toIso(values.due) : TODAY;
      const back = type === "Back in service";
      const list = ids.map((id) => find(id)).filter((l): l is Locker => !!l);
      setLockers((prev) =>
        prev.map((l) =>
          ids.includes(l.id)
            ? {
                ...l,
                history: [
                  {
                    date: TODAY,
                    action: type,
                    note: (note || "No additional notes") + " · due " + fmtDate(due),
                    tech,
                  },
                  ...l.history,
                ],
                status: (back ? "Available" : "Maintenance") as LockerStatus,
                notes: back ? "" : note || type,
                member: null,
                memberId: null,
                since: null,
                expiry: null,
              }
            : l,
        ),
      );
      clearSelection();
      showToast(
        list.length === 1
          ? "Locker " + list[0].num + " · " + type
          : list.length + " lockers · " + type,
      );
    },
    [find, clearSelection, showToast],
  );

  const changeStatus = useCallback(
    (ids: number[], target: LockerStatus) => {
      const list = ids.map((id) => find(id)).filter((l): l is Locker => !!l);
      setLockers((prev) =>
        prev.map((l) => {
          if (!ids.includes(l.id) || l.status === target) return l;
          const updated: Locker = {
            ...l,
            history: [
              {
                date: TODAY,
                action: "Status → " + target,
                note: "Changed from " + l.status,
                tech: "—",
              },
              ...l.history,
            ],
            status: target,
          };
          if (target === "Available" || target === "Maintenance") {
            updated.member = null;
            updated.memberId = null;
            updated.since = null;
            updated.expiry = null;
          }
          return updated;
        }),
      );
      clearSelection();
      showToast((list.length === 1 ? "Locker " + list[0].num : list.length + " lockers") + " → " + target);
    },
    [find, clearSelection, showToast],
  );

  const markFixed = useCallback(
    (id: number) => {
      const l = find(id);
      if (!l) return;
      setLockers((prev) =>
        prev.map((x) =>
          x.id === id
            ? {
                ...x,
                status: "Available" as LockerStatus,
                notes: "",
                history: [
                  { date: TODAY, action: "Back in service", note: "Marked fixed from locker details", tech: "—" },
                  ...x.history,
                ],
              }
            : x,
        ),
      );
      showToast("Locker " + l.num + " back in service");
    },
    [find, showToast],
  );

  const deleteLockers = useCallback(
    (ids: number[]) => {
      const list = ids.map((id) => find(id)).filter((l): l is Locker => !!l);
      const label = list.length === 1 ? "Locker " + list[0].num : list.length + " lockers";
      setLockers((prev) => prev.filter((l) => !ids.includes(l.id)));
      setSelected((prev) => {
        const next = new Set(prev);
        ids.forEach((id) => next.delete(id));
        return next;
      });
      showToast(label + " removed");
    },
    [find, showToast],
  );

  const printLockers = useCallback(
    (rows: Locker[]) => {
      if (!rows.length) {
        showToast("Nothing to print");
        return;
      }
      window.print();
      showToast(
        rows.length === 1 ? "Locker " + rows[0].num + " sent to printer" : rows.length + " lockers sent to printer",
      );
    },
    [showToast],
  );

  const exportLockers = useCallback(
    (format: ExportFormat, rows: Locker[]) => {
      if (!rows.length) {
        showToast("Nothing to export");
        return;
      }
      if (format === "print") {
        printLockers(rows);
        return;
      }
      showToast(rows.length + " locker" + (rows.length === 1 ? "" : "s") + " exported as " + format.toUpperCase());
    },
    [showToast, printLockers],
  );

  const qrDownloaded = useCallback(() => showToast("QR tag downloaded"), [showToast]);

  return {
    lockers,
    filtered,
    pageRows,
    pageInfo,
    kpis,
    tabCounts,
    status,
    setStatus,
    zone,
    setZone,
    search,
    changeSearch,
    size,
    changeSize,
    sort,
    dir,
    changeSort,
    toggleSort,
    view,
    setView,
    page: currentPage,
    setPage,
    per,
    changePer,
    resetFilters,
    selectMode,
    toggleSelectMode,
    selected,
    toggleSelect,
    toggleSelectAll,
    clearSelection,
    selectedIds,
    find,
    saveLocker,
    assignLockers,
    releaseLockers,
    logMaintenance,
    changeStatus,
    markFixed,
    deleteLockers,
    exportLockers,
    printLockers,
    qrDownloaded,
    showToast,
    toast: { message, visible },
  };
}

export default useLockers;

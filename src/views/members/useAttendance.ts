import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { AttendanceRecord, AttendanceStatus } from "../../types/attendance";
import { AVATAR_CLASSES, initials as initialsOf } from "../../utils/formatUtils";
import { ATTENDANCE, HISTORY_DAYS } from "../../utils/json/attendanceData";

/*
   Attendance page state — the React equivalent of the module-level
   ATTENDANCE array plus getFiltered()/updateKpis() in
   tailwind/src/assets/js/attendance.js.
*/

/* Matches withLoading()'s setTimeout in the template. */
const LOADING_MS = 600;

/** "14:05" -> "02:05 PM", the template's fmtTime(). */
export const formatTime = (hhmm: string): string => {
  if (!hhmm) return "—";
  const [hh, mm] = hhmm.split(":");
  let hours = parseInt(hh, 10);
  const period = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${hours < 10 ? "0" + hours : hours}:${mm} ${period}`;
};

/** Duration between two "HH:MM" times, e.g. "1h 36m" — the template's durationOf(). */
export const durationOf = (checkInHH?: string, checkOutHH?: string): string => {
  if (!checkInHH || !checkOutHH) return "—";
  const [inH, inM] = checkInHH.split(":").map(Number);
  const [outH, outM] = checkOutHH.split(":").map(Number);
  const mins = outH * 60 + outM - (inH * 60 + inM);
  if (mins <= 0) return "—";
  const remainder = mins % 60;
  return `${Math.floor(mins / 60)}h ${remainder < 10 ? "0" : ""}${remainder}m`;
};

export type TrainerFilter = "All" | string;
export type StatusFilter = "All" | AttendanceStatus;
export type PlanFilter = "All" | string;

export type EntryFormInput = {
  /** Existing record id when editing; null when adding. */
  id: string | null;
  name: string;
  memberId: string;
  plan: string;
  trainer: string;
  date: string;
  checkInHH: string;
  checkOutHH: string;
  status: AttendanceStatus;
};

/** One row of the bulk-attendance draft, keyed by record id. */
export type BulkSelection = Record<string, AttendanceStatus>;

export type HistoryRow = { day: string; status: AttendanceStatus; checkIn: string };
export type HistoryResult = { rows: HistoryRow[]; rate: number };

export function useAttendance() {
  const [records, setRecords] = useState<AttendanceRecord[]>(ATTENDANCE);
  const [search, setSearch] = useState("");
  const [trainer, setTrainer] = useState<TrainerFilter>("All");
  const [status, setStatus] = useState<StatusFilter>("All");
  /* Set via the Advanced Filters modal only — no toolbar control for it. */
  const [plan, setPlan] = useState<PlanFilter>("All");
  const [loading, setLoading] = useState(true);

  const idSeq = useRef(1010);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runLoading = useCallback(() => {
    setLoading(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setLoading(false), LOADING_MS);
  }, []);

  // Shows the skeleton once on first mount, mirroring init()'s withLoading().
  useEffect(() => {
    const id = setTimeout(() => setLoading(false), LOADING_MS);
    timer.current = id;
    return () => clearTimeout(id);
  }, []);

  const kpis = useMemo(() => {
    const count = (s: AttendanceStatus) =>
      records.filter((record) => record.status === s).length;
    return {
      present: count("Present"),
      absent: count("Absent"),
      late: count("Late"),
      leave: count("On Leave"),
    };
  }, [records]);

  const visible = useMemo(() => {
    const query = search.toLowerCase();
    return records.filter((record) => {
      const haystack = `${record.name}${record.id}${record.plan}`.toLowerCase();
      const matchesQuery = !query || haystack.includes(query);
      const matchesTrainer = trainer === "All" || record.trainer === trainer;
      const matchesStatus = status === "All" || record.status === status;
      const matchesPlan = plan === "All" || record.plan === plan;
      return matchesQuery && matchesTrainer && matchesStatus && matchesPlan;
    });
  }, [records, search, trainer, status, plan]);

  const clearFilters = useCallback(() => {
    setSearch("");
    setTrainer("All");
    setStatus("All");
    setPlan("All");
  }, []);

  const checkIn = useCallback((id: string) => {
    setRecords((prev) =>
      prev.map((record) =>
        record.id === id
          ? { ...record, status: "Present", checkIn: "Just now", checkOut: "—" }
          : record,
      ),
    );
  }, []);

  const checkOut = useCallback((id: string) => {
    setRecords((prev) =>
      prev.map((record) =>
        record.id === id ? { ...record, checkOut: "Just now", hours: "1h 00m" } : record,
      ),
    );
  }, []);

  const saveEntry = useCallback((input: EntryFormInput) => {
    setRecords((prev) => {
      const shared = {
        name: input.name,
        plan: input.plan as AttendanceRecord["plan"],
        trainer: input.trainer,
        date: input.date,
        status: input.status,
        checkIn: formatTime(input.checkInHH),
        checkOut: formatTime(input.checkOutHH),
        hours: durationOf(input.checkInHH, input.checkOutHH),
        inHH: input.checkInHH,
        outHH: input.checkOutHH,
      };
      if (input.id) {
        return prev.map((record) =>
          record.id === input.id
            ? { ...record, ...shared, initials: initialsOf(input.name) }
            : record,
        );
      }
      idSeq.current += 1;
      const created: AttendanceRecord = {
        id: input.memberId.trim() || `A-${idSeq.current}`,
        initials: initialsOf(input.name),
        avatar: AVATAR_CLASSES[prev.length % AVATAR_CLASSES.length],
        ...shared,
      };
      return [created, ...prev];
    });
  }, []);

  const removeRecord = useCallback((id: string) => {
    setRecords((prev) => prev.filter((record) => record.id !== id));
  }, []);

  const markAttendance = useCallback(
    (id: string, nextStatus: AttendanceStatus, timeHH: string) => {
      setRecords((prev) =>
        prev.map((record) => {
          if (record.id !== id) return record;
          if (nextStatus === "Present" || nextStatus === "Late") {
            const checkIn = timeHH
              ? formatTime(timeHH)
              : record.checkIn === "—"
                ? "Just now"
                : record.checkIn;
            return {
              ...record,
              status: nextStatus,
              checkIn,
              inHH: timeHH || record.inHH,
            };
          }
          return { ...record, status: nextStatus, checkIn: "—", checkOut: "—", hours: "—" };
        }),
      );
    },
    [],
  );

  /*
     Applies a bulk-attendance draft. Absent/On Leave rows also clear their
     times, matching bulkSave(). Returns how many statuses actually changed.
  */
  const applyBulk = useCallback((selection: BulkSelection) => {
    let changed = 0;
    setRecords((prev) =>
      prev.map((record) => {
        const next = selection[record.id];
        const statusChanged = Boolean(next) && next !== record.status;
        if (statusChanged) changed += 1;
        const nextStatus = next ?? record.status;
        const clearsTime = nextStatus === "Absent" || nextStatus === "On Leave";
        return {
          ...record,
          status: nextStatus,
          ...(clearsTime ? { checkIn: "—", checkOut: "—", hours: "—" } : {}),
        };
      }),
    );
    return changed;
  }, []);

  /*
     Deterministic 10-day history from the record id — a UI-only demo, ported
     verbatim from openHistory()'s seeded pseudo-random walk.
  */
  const historyFor = useCallback((record: AttendanceRecord): HistoryResult => {
    const seed = record.id.split("").reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
    let present = 0;
    const rows = HISTORY_DAYS.map((day, i) => {
      const v = (seed + i * 7) % 10;
      const dayStatus: AttendanceStatus =
        v < 6 ? "Present" : v < 8 ? "Late" : v < 9 ? "Absent" : "On Leave";
      if (dayStatus === "Present" || dayStatus === "Late") present += 1;
      const checkIn =
        dayStatus === "Absent" || dayStatus === "On Leave"
          ? "—"
          : formatTime(
              `${5 + (v % 4) < 10 ? "0" : ""}${5 + (v % 4)}:${v * 5 < 10 ? "0" : ""}${v * 5}`,
            );
      return { day, status: dayStatus, checkIn };
    });
    return { rows, rate: Math.round((present / HISTORY_DAYS.length) * 100) };
  }, []);

  return {
    records,
    visible,
    loading,
    search,
    setSearch,
    trainer,
    setTrainer,
    status,
    setStatus,
    plan,
    setPlan,
    clearFilters,
    kpis,
    refresh: runLoading,
    checkIn,
    checkOut,
    saveEntry,
    removeRecord,
    markAttendance,
    applyBulk,
    historyFor,
  };
}

export default useAttendance;

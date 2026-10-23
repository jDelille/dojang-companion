import { useCallback, useMemo, useRef, useState } from "react";
import type { CheckinLogEntry, CheckinMember, LogStatus } from "../../types/checkin";
import {
  CAPACITY_ARC,
  CAPACITY_MAX,
  CHECKIN_LOG,
  CHECKIN_MEMBERS,
  INITIAL_INSIDE,
  NOW_TIME,
} from "../../utils/json/checkinData";

/*
   Check-In Station state — the React equivalent of the module-level LOG and
   `inside` counter plus renderLog()/renderCapacity() in
   tailwind/src/assets/js/checkin.js.
*/

export type LogFilter = "All" | LogStatus;

export type CheckInOptions = {
  trainer?: string;
  locker?: string;
  notes?: string;
};

export type EditEntryInput = {
  id: number;
  status: LogStatus;
  trainer: string;
  locker: string;
  time: string;
  notes: string;
};

/** Result of attempting a check-in, so the page can pick the right toast. */
export type CheckInResult =
  | { ok: true; name: string }
  | { ok: false; name: string; reason: "expired" };

export function useCheckin() {
  const [log, setLog] = useState<CheckinLogEntry[]>(CHECKIN_LOG);
  const [inside, setInside] = useState(INITIAL_INSIDE);
  const [filter, setFilter] = useState<LogFilter>("All");
  const [search, setSearch] = useState("");

  /* Continues past the highest seeded log id. */
  const idSeq = useRef(CHECKIN_LOG[CHECKIN_LOG.length - 1].id);

  const visible = useMemo(
    () => log.filter((entry) => filter === "All" || entry.status === filter),
    [log, filter],
  );

  const capacity = useMemo(() => {
    const pct = (inside / CAPACITY_MAX) * 100;
    return {
      inside,
      max: CAPACITY_MAX,
      pct: pct.toFixed(1),
      remaining: CAPACITY_MAX - inside,
      /* Ring offset: full circumference when empty, 0 when at capacity. */
      dashOffset: Math.round(CAPACITY_ARC * (1 - inside / CAPACITY_MAX)),
    };
  }, [inside]);

  /** Members matching a free-text query across name, phone, id and plan. */
  const searchMembers = useCallback((query: string): CheckinMember[] => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return CHECKIN_MEMBERS.filter((member) =>
      `${member.name}${member.phone}${member.mid}${member.plan}`.toLowerCase().includes(q),
    );
  }, []);

  const inlineResults = useMemo(() => searchMembers(search), [search, searchMembers]);

  /*
     Checks a member in, prepending a log row and bumping the occupancy
     count. An expired membership is refused, matching checkInMember().
  */
  const checkInMember = useCallback(
    (name: string, options: CheckInOptions = {}): CheckInResult => {
      const member = CHECKIN_MEMBERS.find((item) => item.name === name);
      if (!member) return { ok: false, name, reason: "expired" };
      if (member.status === "expired") return { ok: false, name, reason: "expired" };

      setLog((prev) => {
        idSeq.current += 1;
        const created: CheckinLogEntry = {
          id: idSeq.current,
          initials: member.initials,
          tint: member.tint,
          name: member.name,
          plan: member.plan,
          time: NOW_TIME,
          status: "In Gym",
          trainer: options.trainer || "Unassigned",
          locker: options.locker || "—",
          notes: options.notes || "—",
        };
        return [created, ...prev];
      });
      setInside((prev) => prev + 1);
      return { ok: true, name };
    },
    [],
  );

  const saveEntry = useCallback((input: EditEntryInput) => {
    setLog((prev) =>
      prev.map((entry) =>
        entry.id === input.id
          ? {
              ...entry,
              status: input.status,
              trainer: input.trainer,
              locker: input.locker.trim() || "—",
              time: input.time.trim() || entry.time,
              notes: input.notes.trim() || "—",
            }
          : entry,
      ),
    );
  }, []);

  /*
     Checking out frees the locker and decrements occupancy. Occupancy is
     read off the current log before updating, so the two setState calls stay
     independent rather than nesting one inside the other's updater.
  */
  const checkOut = useCallback(
    (id: number) => {
      const entry = log.find((item) => item.id === id);
      if (entry?.status === "In Gym") setInside((count) => Math.max(0, count - 1));
      setLog((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: "Checked Out", locker: "—" } : item,
        ),
      );
    },
    [log],
  );

  const removeEntry = useCallback(
    (id: number) => {
      const entry = log.find((item) => item.id === id);
      if (entry?.status === "In Gym") setInside((count) => Math.max(0, count - 1));
      setLog((prev) => prev.filter((item) => item.id !== id));
    },
    [log],
  );

  /*
     Which member the QR scan "identifies" — the template picks one
     deterministically from the current occupancy count.
  */
  const scanMember = useCallback((): CheckinMember => {
    const eligible = CHECKIN_MEMBERS.filter((member) => member.status !== "expired");
    return eligible[Math.floor(inside % 3)] ?? CHECKIN_MEMBERS[0];
  }, [inside]);

  return {
    log,
    visible,
    filter,
    setFilter,
    search,
    setSearch,
    inlineResults,
    searchMembers,
    capacity,
    checkInMember,
    saveEntry,
    checkOut,
    removeEntry,
    scanMember,
  };
}

export default useCheckin;

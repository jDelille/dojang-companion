import { useCallback, useMemo, useRef, useState } from "react";
import type { DayPass, PassStatus, PassTypeName } from "../../types/dayPasses";
import { DAY_PASSES, PASS_TYPES } from "../../utils/json/dayPassesData";

/*
   Day Passes state — the React equivalent of the `state` object plus
   renderKpis()/filtered() in tailwind/src/assets/js/day-passes.js.
*/

export type PassTab = "All" | PassStatus;

export const PASS_TABS: PassTab[] = ["All", "Active", "Used", "Converted"];

/** Fee for a pass type; unknown types are free. */
export const feeOf = (type: PassTypeName): number =>
  PASS_TYPES.find((item) => item.name === type)?.fee ?? 0;

/* A pass counts as "today" when its check-in reads as a clock time. */
const isToday = (pass: DayPass) => /AM|PM/.test(pass.checkin);

export type IssuePassInput = {
  name: string;
  phone: string;
  type: PassTypeName;
  ref: string;
};

export type EditPassInput = {
  id: number;
  name: string;
  phone: string;
  ref: string;
  type: PassTypeName;
  status: PassStatus;
};

/*
   Deterministic 5×5 QR pattern from a seed string — a decorative stand-in,
   ported from renderQR() in the template. Returns which cells are filled.
*/
export const qrCells = (seed: string): boolean[] => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash << 5) - hash + seed.charCodeAt(i);
  hash = Math.abs(hash);
  return Array.from({ length: 25 }, (_, i) => {
    // Corners are always on so the pattern reads as a code.
    const corner = i === 0 || i === 4 || i === 20 || i === 24;
    return corner || ((hash >> (i % 30)) ^ (i * 7)) % 3 === 0;
  });
};

export function useDayPasses() {
  const [passes, setPasses] = useState<DayPass[]>(DAY_PASSES);
  const [tab, setTab] = useState<PassTab>("All");
  const [search, setSearch] = useState("");
  /** The ticket preview shows the most recently issued pass. */
  const [latest, setLatest] = useState<DayPass>(DAY_PASSES[0]);

  const idSeq = useRef(DAY_PASSES.length);

  const kpis = useMemo(() => {
    const today = passes.filter(isToday);
    return {
      today: today.length,
      inside: passes.filter((pass) => pass.status === "Active").length,
      revenue: today.reduce((sum, pass) => sum + pass.fee, 0),
      converted: passes.filter((pass) => pass.status === "Converted").length,
    };
  }, [passes]);

  const counts = useMemo(() => {
    const base: Record<PassTab, number> = {
      All: passes.length,
      Active: 0,
      Used: 0,
      Converted: 0,
    };
    passes.forEach((pass) => {
      base[pass.status] += 1;
    });
    return base;
  }, [passes]);

  const visible = useMemo(() => {
    const query = search.toLowerCase();
    return passes.filter((pass) => {
      const matchesQuery =
        !query ||
        pass.name.toLowerCase().includes(query) ||
        pass.code.toLowerCase().includes(query);
      const matchesTab = tab === "All" || pass.status === tab;
      return matchesQuery && matchesTab;
    });
  }, [passes, search, tab]);

  /** Issues a pass, prepends it and makes it the ticket preview. */
  const issuePass = useCallback((input: IssuePassInput): DayPass => {
    idSeq.current += 1;
    const created: DayPass = {
      id: idSeq.current,
      // Matches the template's "DP-" + (7200 + idSeq) after the increment.
      code: `DP-${7200 + idSeq.current + 1}`,
      name: input.name.trim(),
      phone: input.phone.trim() || "—",
      type: input.type,
      checkin: "Just now",
      status: "Active",
      ref: input.ref.trim(),
      fee: feeOf(input.type),
    };
    setPasses((prev) => [created, ...prev]);
    setLatest(created);
    return created;
  }, []);

  const savePass = useCallback((input: EditPassInput) => {
    setPasses((prev) =>
      prev.map((pass) =>
        pass.id === input.id
          ? {
              ...pass,
              name: input.name.trim() || pass.name,
              phone: input.phone.trim() || "—",
              ref: input.ref.trim(),
              type: input.type,
              fee: feeOf(input.type),
              status: input.status,
            }
          : pass,
      ),
    );
  }, []);

  /** Selling swaps the pass type and puts the guest back inside. */
  const sellPass = useCallback((id: number, type: PassTypeName) => {
    setPasses((prev) =>
      prev.map((pass) =>
        pass.id === id ? { ...pass, type, fee: feeOf(type), status: "Active" } : pass,
      ),
    );
  }, []);

  const renewPass = useCallback((id: number) => {
    setPasses((prev) =>
      prev.map((pass) =>
        pass.id === id ? { ...pass, status: "Active", checkin: "Just now" } : pass,
      ),
    );
  }, []);

  const convertPass = useCallback((id: number) => {
    setPasses((prev) =>
      prev.map((pass) => (pass.id === id ? { ...pass, status: "Converted" } : pass)),
    );
  }, []);

  const checkOut = useCallback((id: number) => {
    setPasses((prev) =>
      prev.map((pass) => (pass.id === id ? { ...pass, status: "Used" } : pass)),
    );
  }, []);

  const removePass = useCallback((id: number) => {
    setPasses((prev) => prev.filter((pass) => pass.id !== id));
  }, []);

  return {
    passes,
    visible,
    latest,
    kpis,
    counts,
    tab,
    setTab,
    search,
    setSearch,
    issuePass,
    savePass,
    sellPass,
    renewPass,
    convertPass,
    checkOut,
    removePass,
  };
}

export default useDayPasses;

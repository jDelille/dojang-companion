import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Member, MemberStatus, PlanLabel } from "../../types/members";
import { MEMBERS, NEXT_EXPIRY } from "../../utils/json/membersData";
import { AVATAR_CLASSES } from "../../utils/formatUtils";

/*
   Members page state — the React equivalent of the module-level MEMBERS
   object plus filteredMembers()/renderTable() in
   tailwind/src/assets/js/members.js.

   The template mutated MEMBERS in place and re-rendered by hand; here every
   mutation replaces the array so React re-renders on its own.
*/

export type PlanFilter = "All Plans" | PlanLabel;
export type StatusFilter = "All Status" | "Active" | "Expiring" | "Expired";

export type NewMemberInput = {
  first: string;
  last: string;
  phone: string;
  email: string;
  plan: PlanLabel;
  trainer: string;
};

export type EditMemberInput = {
  id: string;
  first: string;
  last: string;
  phone: string;
  email: string;
  plan: PlanLabel;
  trainer: string;
  status: MemberStatus;
  expiry: string;
};

/** "Ashley","Bennett" -> "AB" — the template's iniOf(). */
const initialsOf = (first: string, last: string) =>
  ((first[0] || "") + (last[0] || "")).toUpperCase();

/* Matches withLoading()'s setTimeout in the template. */
const LOADING_MS = 600;

export function useMembers() {
  const [members, setMembers] = useState<Member[]>(MEMBERS);
  const [search, setSearch] = useState("");
  const [plan, setPlan] = useState<PlanFilter>("All Plans");
  const [status, setStatus] = useState<StatusFilter>("All Status");
  const [loading, setLoading] = useState(true);

  /* The id counter continues from the highest seeded member. */
  const idSeq = useRef(1004);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runLoading = useCallback(() => {
    setLoading(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setLoading(false), LOADING_MS);
  }, []);

  /*
     `loading` starts true so the skeleton shows on first paint, the way the
     template's withLoading() call in init() did. This effect only owns the
     timer that clears it — no state is set synchronously on mount.
  */
  useEffect(() => {
    const id = setTimeout(() => setLoading(false), LOADING_MS);
    timer.current = id;
    return () => clearTimeout(id);
  }, []);

  const visible = useMemo(() => {
    const query = search.toLowerCase();
    return members.filter((member) => {
      const haystack = `${member.id} ${member.first} ${member.last} ${member.phone}`.toLowerCase();
      const matchesQuery = !query || haystack.includes(query);
      const matchesPlan = plan === "All Plans" || member.planLabel === plan;
      const matchesStatus = status === "All Status" || member.status === status;
      return matchesQuery && matchesPlan && matchesStatus;
    });
  }, [members, search, plan, status]);

  const addMember = useCallback((input: NewMemberInput) => {
    setMembers((prev) => {
      idSeq.current += 1;
      const created: Member = {
        id: "M-" + (idSeq.current + 1000),
        first: input.first.trim(),
        last: input.last.trim(),
        phone: input.phone.trim() || "—",
        email: input.email.trim() || "—",
        planLabel: input.plan,
        trainer: input.trainer,
        checkins: 0,
        status: "Active",
        expiry: "2027-01-15",
        expiresDisp: "Jan 15, 2027",
        av: AVATAR_CLASSES[prev.length % AVATAR_CLASSES.length],
        ini: initialsOf(input.first, input.last || " "),
      };
      return [...prev, created];
    });
  }, []);

  /* Blank name/phone/email fall back the way saveEdit() did. */
  const updateMember = useCallback((input: EditMemberInput) => {
    setMembers((prev) =>
      prev.map((member) => {
        if (member.id !== input.id) return member;
        const first = input.first.trim() || member.first;
        const last = input.last.trim();
        return {
          ...member,
          first,
          last,
          phone: input.phone.trim() || "—",
          email: input.email.trim() || "—",
          planLabel: input.plan,
          trainer: input.trainer,
          status: input.status,
          expiry: input.expiry,
          ini: initialsOf(first, last || " "),
        };
      }),
    );
  }, []);

  const checkIn = useCallback((id: string) => {
    setMembers((prev) =>
      prev.map((member) =>
        member.id === id ? { ...member, checkins: member.checkins + 1 } : member,
      ),
    );
  }, []);

  /** Renewing also reactivates the member and pushes out the expiry. */
  const renew = useCallback((id: string, nextPlan: PlanLabel) => {
    setMembers((prev) =>
      prev.map((member) => {
        if (member.id !== id) return member;
        const [expiry, expiresDisp] = NEXT_EXPIRY[nextPlan];
        return { ...member, planLabel: nextPlan, status: "Active", expiry, expiresDisp };
      }),
    );
  }, []);

  const setStatusOf = useCallback((id: string, next: MemberStatus) => {
    setMembers((prev) =>
      prev.map((member) => (member.id === id ? { ...member, status: next } : member)),
    );
  }, []);

  const removeMember = useCallback((id: string) => {
    setMembers((prev) => prev.filter((member) => member.id !== id));
  }, []);

  return {
    members,
    visible,
    loading,
    search,
    setSearch,
    plan,
    setPlan,
    status,
    setStatus,
    refresh: runLoading,
    addMember,
    updateMember,
    checkIn,
    renew,
    setStatusOf,
    removeMember,
  };
}

export default useMembers;

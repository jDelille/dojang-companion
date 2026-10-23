import { useCallback, useMemo, useState } from "react";
import type {
  AttendanceMark,
  StaffFormValues,
  StaffMember,
  StaffRoleValues,
  StaffStatus,
} from "../../types/staff";
import { SHIFT_TIME, STAFF, WEEK } from "../../utils/json/staffData";
import useToast from "../../hooks/useToast";

/*
   Staff state — ported from tailwind/src/assets/js/staff.js. Owns the
   department tab, search and grid/list view, and derives the KPIs, today's
   roster bars and the filtered directory.
*/

/** "$5,200" — the inr() helper. */
export const inr = (n: number) => "$" + Number(n).toLocaleString("en-US");

/** "DF" — the initials() helper. */
export const initials = (name: string) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

/** Deterministic week pattern from id + current status, as openAttendance() built. */
export const attendanceWeek = (staff: StaffMember): AttendanceMark[] =>
  WEEK.map((_d, i) => {
    if (i >= 5) return "off";
    if (staff.status === "Leave" && i === 4) return "leave";
    return (staff.id + i) % 6 === 0 ? "leave" : "present";
  });

export function useStaff() {
  const { message, visible, showToast } = useToast();

  const [staff, setStaff] = useState<StaffMember[]>(STAFF);
  const [dept, setDept] = useState("All");
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");

  const find = useCallback(
    (id: number) => staff.find((s) => s.id === id) ?? null,
    [staff],
  );

  const kpis = useMemo(
    () => ({
      total: staff.length,
      present: staff.filter((s) => s.status === "Present").length,
      leave: staff.filter((s) => s.status === "Leave").length,
      depts: new Set(staff.map((s) => s.dept)).size,
    }),
    [staff],
  );

  /** Today's roster: everyone not on leave, first eight, with their shift bar. */
  const roster = useMemo(
    () =>
      staff
        .filter((s) => s.status !== "Leave")
        .slice(0, 8)
        .map((s) => ({
          staff: s,
          width: s.shift === "Morning" ? "48%" : s.shift === "Evening" ? "48%" : "20%",
          offset: s.shift === "Evening",
          label: s.shift === "Off" ? "Off" : SHIFT_TIME[s.shift],
        })),
    [staff],
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return staff.filter((s) => {
      const mq = !q || s.name.toLowerCase().includes(q) || s.role.toLowerCase().includes(q);
      const md = dept === "All" || s.dept === dept;
      return mq && md;
    });
  }, [staff, dept, search]);

  /* ---------- Mutations ---------- */

  const saveStaff = useCallback(
    (values: StaffFormValues, editId: number | null) => {
      const name = values.name.trim();
      if (!name) {
        showToast("Enter a name");
        return false;
      }

      const data = {
        name,
        role: values.role.trim() || "Staff",
        dept: values.dept,
        shift: values.shift,
        phone: values.phone.trim() || "—",
        email: values.email.trim() || "—",
        salary: Number(values.salary) || 0,
      };

      if (editId != null) {
        setStaff((prev) => prev.map((s) => (s.id === editId ? { ...s, ...data } : s)));
        showToast('"' + name + '" updated');
      } else {
        setStaff((prev) => [
          {
            ...data,
            id: prev.reduce((max, s) => Math.max(max, s.id), 0) + 1,
            status: (values.shift === "Off" ? "Off" : "Present") as StaffStatus,
          },
          ...prev,
        ]);
        showToast('"' + name + '" added');
      }
      return true;
    },
    [showToast],
  );

  const assignRole = useCallback(
    (id: number, values: StaffRoleValues) => {
      const s = find(id);
      if (!s) return;
      const role = values.role.trim() || s.role;
      setStaff((prev) =>
        prev.map((x) =>
          x.id === id ? { ...x, role, dept: values.dept, shift: values.shift } : x,
        ),
      );
      showToast(s.name + " → " + role + " · " + values.dept);
    },
    [find, showToast],
  );

  const markAttendance = useCallback(
    (id: number, status: StaffStatus) => {
      const s = find(id);
      if (!s) return;
      setStaff((prev) => prev.map((x) => (x.id === id ? { ...x, status } : x)));
      showToast(s.name + " marked " + status);
    },
    [find, showToast],
  );

  const processSalary = useCallback(
    (id: number) => {
      const s = find(id);
      showToast("Salary processed for " + (s ? s.name : "staff"));
    },
    [find, showToast],
  );

  const deleteStaff = useCallback(
    (id: number) => {
      const s = find(id);
      setStaff((prev) => prev.filter((x) => x.id !== id));
      showToast('"' + (s?.name ?? "Staff member") + '" removed');
    },
    [find, showToast],
  );

  const exportStaff = useCallback(() => showToast("Staff list exported"), [showToast]);

  return {
    staff,
    filtered,
    roster,
    kpis,
    dept,
    setDept,
    search,
    setSearch,
    view,
    setView,
    find,
    saveStaff,
    assignRole,
    markAttendance,
    processSalary,
    deleteStaff,
    exportStaff,
    toast: { message, visible },
  };
}

export default useStaff;

import { useCallback, useMemo, useState } from "react";
import type { Role, RoleFormValues } from "../../types/accessControl";
import {
  CAPACITY,
  DEVICES,
  EVENTS,
  ROLES,
} from "../../utils/json/accessControlData";
import useToast from "../../hooks/useToast";

/*
   Access Control state — ported from tailwind/src/assets/js/access-control.js.
   Owns the log tab / door / search filters and the roles list, and derives the
   KPIs, filtered log, occupancy, security alerts and role cards. Devices,
   events and occupancy are static, matching the template's seed data.
*/

/** "DF" — the initials() helper. */
export const initials = (name: string) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

const OCCUPANCY = 138;

export function useAccessControl() {
  const { message, visible, showToast } = useToast();

  const [roles, setRoles] = useState<Role[]>(ROLES);
  const [tab, setTab] = useState("All");
  const [door, setDoor] = useState("All");
  const [search, setSearch] = useState("");

  const occupancy = OCCUPANCY;

  const findRole = useCallback(
    (id: number) => roles.find((r) => r.id === id) ?? null,
    [roles],
  );

  const kpis = useMemo(() => {
    const online = DEVICES.filter((d) => d.status === "Online").length;
    return {
      entries: EVENTS.filter((e) => e.type === "Granted").length,
      inside: occupancy,
      denied: EVENTS.filter((e) => e.type === "Denied").length,
      online: online + "/" + DEVICES.length,
    };
  }, [occupancy]);

  const tabCounts = useMemo(() => {
    const counts = { All: EVENTS.length, Granted: 0, Denied: 0, Exit: 0 };
    EVENTS.forEach((e) => {
      counts[e.type]++;
    });
    return counts as Record<string, number>;
  }, []);

  /** Occupancy ring — percent, ring degrees, colour label and its class. */
  const occ = useMemo(() => {
    const pct = Math.min(100, Math.round((occupancy / CAPACITY) * 100));
    let label: string;
    let cls: string;
    if (pct >= 90) {
      label = "Near capacity";
      cls = "text-[12px] c-red font-semibold mt-3";
    } else if (pct >= 70) {
      label = "Busy";
      cls = "text-[12px] c-orange font-semibold mt-3";
    } else {
      label = "Comfortable";
      cls = "text-[12px] c-green font-semibold mt-3";
    }
    return { pct, deg: pct * 3.6, count: occupancy, cap: CAPACITY, label, cls };
  }, [occupancy]);

  /** Offline devices + the first three denied events, as renderAlerts() built. */
  const alerts = useMemo(() => {
    const list: { icon: string; color: string; title: string; sub: string }[] = [];
    DEVICES.filter((d) => d.status === "Offline").forEach((d) =>
      list.push({
        icon: "wifi-off",
        color: "#F87171",
        title: d.name + " offline",
        sub: "Device not responding",
      }),
    );
    EVENTS.filter((e) => e.type === "Denied")
      .slice(0, 3)
      .forEach((e) =>
        list.push({
          icon: "shield-alert",
          color: "#FB923C",
          title: e.reason || "Access denied",
          sub: e.name + " · " + e.door,
        }),
      );
    return list;
  }, []);

  const filteredLog = useMemo(() => {
    const q = search.toLowerCase();
    return EVENTS.filter((e) => {
      const mq = !q || e.name.toLowerCase().includes(q) || e.door.toLowerCase().includes(q);
      const mt = tab === "All" || e.type === tab;
      const md = door === "All" || e.door === door;
      return mq && mt && md;
    });
  }, [tab, door, search]);

  /* ---------- Mutations ---------- */

  const saveRole = useCallback(
    (values: RoleFormValues, editId: number | null) => {
      const name = values.name.trim();
      if (!name) {
        showToast("Enter a role name");
        return false;
      }
      const data = {
        name,
        desc: values.desc.trim() || "No description",
        level: values.level,
      };
      if (editId != null) {
        setRoles((prev) => prev.map((r) => (r.id === editId ? { ...r, ...data } : r)));
        showToast('"' + name + '" updated');
      } else {
        setRoles((prev) => [
          ...prev,
          {
            ...data,
            id: prev.reduce((max, r) => Math.max(max, r.id), 0) + 1,
            users: 0,
            icon: "shield",
            perms: ["Dashboard"],
          },
        ]);
        showToast('"' + name + '" created');
      }
      return true;
    },
    [showToast],
  );

  const assignPerms = useCallback(
    (id: number, perms: string[]) => {
      const r = findRole(id);
      if (!r) return;
      setRoles((prev) => prev.map((x) => (x.id === id ? { ...x, perms } : x)));
      showToast(perms.length + " permission" + (perms.length === 1 ? "" : "s") + " set for " + r.name);
    },
    [findRole, showToast],
  );

  const cloneRole = useCallback(
    (id: number, newName: string) => {
      const r = findRole(id);
      if (!r) return;
      const name = newName.trim() || r.name + " (Copy)";
      setRoles((prev) => [
        ...prev,
        {
          id: prev.reduce((max, x) => Math.max(max, x.id), 0) + 1,
          name,
          desc: r.desc,
          level: r.level,
          users: 0,
          icon: r.icon,
          perms: r.perms.slice(),
        },
      ]);
      showToast('"' + name + '" created from "' + r.name + '"');
    },
    [findRole, showToast],
  );

  const deleteRole = useCallback(
    (id: number) => {
      const r = findRole(id);
      const name = r ? r.name : "Role";
      setRoles((prev) => prev.filter((x) => x.id !== id));
      showToast('"' + name + '" deleted');
    },
    [findRole, showToast],
  );

  const remoteUnlock = useCallback(
    (doorName: string, duration: string) => {
      showToast(doorName + " unlocked for " + duration);
    },
    [showToast],
  );

  const deviceUnlock = useCallback(
    (doorName: string) => {
      showToast(doorName + " unlocked remotely");
    },
    [showToast],
  );

  const exportAccess = useCallback(() => showToast("Access data exported"), [showToast]);

  return {
    roles,
    tab,
    setTab,
    door,
    setDoor,
    search,
    setSearch,
    kpis,
    tabCounts,
    occ,
    alerts,
    filteredLog,
    logTotal: EVENTS.length,
    findRole,
    saveRole,
    assignPerms,
    cloneRole,
    deleteRole,
    remoteUnlock,
    deviceUnlock,
    exportAccess,
    toast: { message, visible },
  };
}

export default useAccessControl;

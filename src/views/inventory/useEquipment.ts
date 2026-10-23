import { useCallback, useMemo, useState } from "react";
import type {
  Equipment,
  EquipmentFormValues,
  EquipmentStatus,
  EquipmentView,
  MaintenanceValues,
} from "../../types/equipment";
import { EQUIPMENT, EQ_TODAY } from "../../utils/json/equipmentData";
import useToast from "../../hooks/useToast";

/*
   Equipment state — ported from tailwind/src/assets/js/equipment.js. Owns the
   grid/list view, search and the category + status filters, and derives the
   KPIs, the filtered asset list and the maintenance schedule.
*/

/** Health-bar colour thresholds, matching condColor(). */
export const condColor = (c: number) => {
  if (c >= 75) return "#4ADE80";
  if (c >= 50) return "#F4D03F";
  if (c >= 25) return "#FB923C";
  return "#F87171";
};

/** Derives a status from a condition score, as statusFromCondition() did. */
export const statusFromCondition = (c: number): EquipmentStatus =>
  c === 0 ? "Out of Order" : c < 50 ? "Service Due" : "Operational";

/** "Jul 14, 2026" — the format fmtDate() produced. */
export const fmtDate = (date: Date | null) =>
  date
    ? date.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })
    : "";

export function useEquipment() {
  const { message, visible, showToast } = useToast();

  const [equipment, setEquipment] = useState<Equipment[]>(EQUIPMENT);
  const [view, setView] = useState<EquipmentView>("grid");
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("All");
  const [status, setStatus] = useState("All");

  const find = useCallback(
    (id: number) => equipment.find((e) => e.id === id) ?? null,
    [equipment],
  );

  const kpis = useMemo(
    () => ({
      total: equipment.reduce((t, e) => t + e.qty, 0),
      operational: equipment.filter((e) => e.status === "Operational").length,
      maintenance: equipment.filter(
        (e) => e.status === "Maintenance" || e.status === "Out of Order",
      ).length,
      service: equipment.filter((e) => e.status === "Service Due").length,
    }),
    [equipment],
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return equipment.filter((e) => {
      const mq = !q || e.name.toLowerCase().includes(q) || e.asset.toLowerCase().includes(q);
      const mc = cat === "All" || e.category === cat;
      const ms = status === "All" || e.status === status;
      return mq && mc && ms;
    });
  }, [equipment, cat, status, search]);

  /** Schedule lists everything needing attention first, then the healthy assets. */
  const schedule = useMemo(() => {
    const needsWork = equipment.filter((e) => e.status !== "Operational");
    const healthy = equipment.filter((e) => e.status === "Operational");
    return [...needsWork, ...healthy];
  }, [equipment]);

  /* ---------- Mutations ---------- */

  const saveEquipment = useCallback(
    (values: EquipmentFormValues, editId: number | null) => {
      const name = values.name.trim();
      if (!name) {
        showToast("Enter an equipment name");
        return false;
      }

      const condition = Math.max(0, Math.min(100, Number(values.condition) || 0));

      if (editId != null) {
        setEquipment((prev) =>
          prev.map((e) =>
            e.id === editId
              ? {
                  ...e,
                  name,
                  category: values.category,
                  asset: values.asset.trim() || e.asset,
                  qty: Math.max(1, Number(values.qty) || 1),
                  condition,
                  location: values.location,
                  status: values.status,
                }
              : e,
          ),
        );
        showToast('"' + name + '" updated');
      } else {
        setEquipment((prev) => [
          {
            id: prev.reduce((max, e) => Math.max(max, e.id), 0) + 1,
            name,
            category: values.category,
            asset:
              values.asset.trim() || "EQ-" + String(prev.length + 1).padStart(3, "0"),
            qty: Math.max(1, Number(values.qty) || 1),
            condition,
            location: values.location,
            status: values.status,
            lastService: EQ_TODAY,
            nextService: "6 months",
            history: [
              {
                date: EQ_TODAY,
                action: "Routine Service",
                note: "Scheduled maintenance completed",
              },
            ],
          },
          ...prev,
        ]);
        showToast('"' + name + '" added');
      }
      return true;
    },
    [showToast],
  );

  /*
     Logging maintenance both mutates the asset and prepends a history entry.
     Each maintenance type drives a different condition/status outcome, matching
     confirmMaintenance().
  */
  const logMaintenance = useCallback(
    (id: number, values: MaintenanceValues) => {
      const target = find(id);
      if (!target) return;

      setEquipment((prev) =>
        prev.map((e) => {
          if (e.id !== id) return e;

          let condition = e.condition;
          let nextStatus: EquipmentStatus;
          if (values.type === "Mark Serviced") {
            condition = 100;
            nextStatus = "Operational";
          } else if (values.type === "Send to Maintenance") {
            nextStatus = "Maintenance";
          } else if (values.type === "Report Out of Order") {
            condition = 0;
            nextStatus = "Out of Order";
          } else {
            condition = Math.max(0, Math.min(100, Number(values.condition) || e.condition));
            nextStatus = statusFromCondition(condition);
          }

          return {
            ...e,
            condition,
            status: nextStatus,
            lastService: EQ_TODAY,
            nextService: values.next ? fmtDate(values.next) : e.nextService,
            history: [
              { date: EQ_TODAY, action: values.type, note: values.note.trim() || "—" },
              ...e.history,
            ],
          };
        }),
      );
      showToast(target.name + " · " + values.type);
    },
    [find, showToast],
  );

  const assignLocation = useCallback(
    (id: number, location: string) => {
      const target = find(id);
      setEquipment((prev) => prev.map((e) => (e.id === id ? { ...e, location } : e)));
      if (target) showToast(target.name + " moved to " + location);
    },
    [find, showToast],
  );

  const deleteEquipment = useCallback(
    (id: number) => {
      const target = find(id);
      setEquipment((prev) => prev.filter((e) => e.id !== id));
      showToast('"' + (target?.name ?? "Equipment") + '" retired');
    },
    [find, showToast],
  );

  const exportEquipment = useCallback(
    () => showToast("Equipment list exported"),
    [showToast],
  );

  return {
    equipment,
    filtered,
    schedule,
    kpis,
    view,
    setView,
    search,
    setSearch,
    cat,
    setCat,
    status,
    setStatus,
    find,
    saveEquipment,
    logMaintenance,
    assignLocation,
    deleteEquipment,
    exportEquipment,
    toast: { message, visible },
  };
}

export default useEquipment;

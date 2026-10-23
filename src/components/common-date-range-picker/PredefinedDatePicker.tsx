import { useCallback, useMemo, useState } from "react";
import { Calendar } from "primereact/calendar";
import { CalendarDays } from "lucide-react";
import { TRIGGER_ICON, calendarPt } from "../common/tokens";

type Range = [Date, Date];

function formatDate(date: Date) {
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
  });
}

const startOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);

const endOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);

const addDays = (date: Date, days: number) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);

function buildPresets(now: Date): { label: string; range: Range }[] {
  const today = startOfDay(now);
  return [
    { label: "Today", range: [today, endOfDay(now)] },
    {
      label: "Yesterday",
      range: [startOfDay(addDays(now, -1)), endOfDay(addDays(now, -1))],
    },
    { label: "Last 7 Days", range: [startOfDay(addDays(now, -6)), endOfDay(now)] },
    { label: "Last 30 Days", range: [startOfDay(addDays(now, -29)), endOfDay(now)] },
    {
      label: "This Month",
      range: [
        new Date(now.getFullYear(), now.getMonth(), 1),
        endOfDay(new Date(now.getFullYear(), now.getMonth() + 1, 0)),
      ],
    },
    {
      label: "Last Month",
      range: [
        new Date(now.getFullYear(), now.getMonth() - 1, 1),
        endOfDay(new Date(now.getFullYear(), now.getMonth(), 0)),
      ],
    },
  ];
}

export type PredefinedDatePickerProps = {
  className?: string;
  ariaLabel?: string;
  onChange?: (range: Range) => void;
};

export default function PredefinedDatePicker({
  className = "",
  ariaLabel = "Date range picker",
  onChange,
}: PredefinedDatePickerProps) {
  const presets = useMemo(() => buildPresets(new Date()), []);
  const [range, setRange] = useState<(Date | null)[]>(presets[0].range);

  const [start, end] = range;

  const commit = useCallback(
    (next: (Date | null)[]) => {
      setRange(next);
      const [from, to] = next;
      if (from && to) onChange?.([from, to]);
    },
    [onChange],
  );

  const footer = (
    <div className="flex flex-wrap gap-1 pt-2 mt-2 border-t border-[var(--border)]">
      {presets.map((preset) => (
        <button
          key={preset.label}
          type="button"
          onClick={() => commit(preset.range)}
          className="px-2 py-1 text-[calc(11px*var(--fs))] rounded-[calc(6px*var(--rs))] text-[var(--dim)] hover:bg-[rgba(var(--gold-rgb),0.08)] hover:text-[var(--text)] cursor-pointer bg-transparent border-0"
        >
          {preset.label}
        </button>
      ))}
    </div>
  );

  return (
    <div data-component="date-range-picker" className={`relative ${className}`}>
      <Calendar
        unstyled
        pt={calendarPt}
        value={range as Date[]}
        onChange={(event) => commit((event.value as Date[]) ?? [])}
        selectionMode="range"
        readOnlyInput
        numberOfMonths={2}
        aria-label={ariaLabel}
        showIcon
        icon={<CalendarDays className={TRIGGER_ICON} aria-hidden="true" />}
        footerTemplate={() => footer}
        placeholder={
          start && end ? `${formatDate(start)} - ${formatDate(end)}` : "Select range"
        }
      />
    </div>
  );
}

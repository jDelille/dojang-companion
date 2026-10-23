import {
  DollarSign,
  Dumbbell,
  Receipt,
  RefreshCw,
  ScanLine,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import useCounter from "../../../hooks/useCounter";

/*
   Today's Summary widget, ported from the .sc-sales cards in
   tailwind/src/pos.html.

   The count-up uses the shared useCounter hook, which already matches
   animateCounters()'s 1.4s window and cubic ease-out.
*/

type Stat = {
  target: number;
  prefix?: string;
  label: string;
  tint: string;
  tone: string;
  Icon: LucideIcon;
};

const STATS: Stat[] = [
  { target: 8940, prefix: "$", label: "Today's Sales", tint: "tint-gold", tone: "t-gold", Icon: DollarSign },
  { target: 147, label: "Orders", tint: "tint-indigo", tone: "t-indigo", Icon: Receipt },
  { target: 312, label: "Check-ins", tint: "tint-orange", tone: "t-orange", Icon: ScanLine },
  { target: 45500, prefix: "$", label: "Revenue (MTD)", tint: "tint-green", tone: "t-green", Icon: TrendingUp },
  { target: 26, label: "PT Bookings", tint: "tint-cyan", tone: "t-cyan", Icon: Dumbbell },
  { target: 52, label: "Renewals", tint: "tint-yellow", tone: "t-yellow", Icon: RefreshCw },
];

/* A hook cannot be called in a loop, so each card owns its own counter. */
const SummaryCard = ({ target, prefix, label, tint, tone, Icon }: Stat) => {
  const value = useCounter(target, prefix);
  return (
    <div className="sc-sales reveal">
      <span className="sc-sales-bar" />
      <div className={`icon-box w-10! h-10! ${tint}`}>
        <Icon className={`ic-16 ${tone}`} aria-hidden="true" />
      </div>
      <div>
        <div className="text-lg font-black c-text counter">{value}</div>
        <div className="text-[11px] font-medium t-muted">{label}</div>
      </div>
    </div>
  );
};

const PosSummary = () => (
  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-5">
    {STATS.map((s) => (
      <SummaryCard key={s.label} {...s} />
    ))}
  </div>
);

export default PosSummary;

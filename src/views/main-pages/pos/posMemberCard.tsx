import { User } from "lucide-react";
import { spawnRipple } from "./ripple";

/*
   Member information card, ported from the .gold-border-card block in
   tailwind/src/pos.html.

   The figures are template data in the source too — the card describes the
   member on file, not the live cart, so nothing here is derived.
*/

const STATS = [
  { value: "340", label: "Loyalty", tone: "gt" },
  { value: "142", label: "Visits", tone: "c-text" },
  { value: "D. Foster", label: "Trainer", tone: "c-text" },
  { value: "23.4", label: "BMI", tone: "c-text" },
  { value: "$45", label: "Outstanding", tone: "t-red" },
  { value: "Today", label: "Last Visit", tone: "c-text" },
];

const PosMemberCard = ({ onProfile }: { onProfile: () => void }) => (
  <div className="gold-border-card p-4">
    <div className="flex items-start gap-4 flex-wrap">
      <div className="relative shrink-0">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black grad-gold">
          PS
        </div>
        <div className="notif-dot pulse-gold" />
      </div>
      <div className="flex-1 min-w-[180px]">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="text-base font-black c-text">Ashley Bennett</h3>
          <span className="badge-active text-[10px] font-bold px-2 py-0.5 rounded-full">
            Active
          </span>
          <span className="badge-paid text-[10px] font-bold px-2 py-0.5 rounded-full">
            👑 Premium
          </span>
        </div>
        <div className="text-[11px] mt-0.5 t-muted">
          ID: M-1001 · Annual Premium · Expires Jan 15, 2027
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mt-3">
          {STATS.map((s) => (
            <div key={s.label}>
              <div className={`text-sm font-black ${s.tone}`}>{s.value}</div>
              <div className="text-[10px] t-muted">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
      <button
        type="button"
        className="btn-ghost ripple px-3 py-2 text-xs flex items-center gap-1.5 shrink-0"
        onClick={(e) => {
          spawnRipple(e);
          onProfile();
        }}
      >
        <User className="ic-13" aria-hidden="true" />
        Profile
      </button>
    </div>
  </div>
);

export default PosMemberCard;

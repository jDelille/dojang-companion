import { BadgePercent, CirclePlus } from "lucide-react";
import HScroll from "./hScroll";
import { PLANS } from "./posData";
import { cur } from "./posUtils";
import { spawnRipple } from "./ripple";

/*
   Membership & program shortcut rail, ported from renderPlans() in
   tailwind/src/assets/js/pos.js.

   Plans without a catalogue id (Half-Yearly, CrossFit, Zumba, Swimming) used
   to only fire a toast — they now add a priced line like any other, via
   onAddNamed.
*/

type PosPlanShortcutsProps = {
  onAdd: (id: number) => void;
  onAddNamed: (name: string, price: number, emoji: string) => void;
};

const PosPlanShortcuts = ({ onAdd, onAddNamed }: PosPlanShortcutsProps) => (
  <div className="glass-card p-4 mb-5">
    <div className="flex items-center justify-between mb-3">
      <h3 className="font-bold c-text flex items-center gap-2 text-sm">
        <BadgePercent className="ic-15 t-gold" aria-hidden="true" />
        Membership &amp; Program Shortcuts
      </h3>
      <span className="text-[11px] t-muted">One tap to add</span>
    </div>
    <HScroll label="plans" className="hscroll-oncard" trackClassName="gap-3 pb-1">
      {PLANS.map((p) => (
        <div
          key={p.name}
          className="plan-card ripple"
          role="button"
          tabIndex={0}
          onClick={(e) => {
            spawnRipple(e);
            if (p.id) onAdd(p.id);
            else onAddNamed(p.name, p.price, p.emoji);
          }}
          onKeyDown={(e) => {
            if (e.key !== "Enter" && e.key !== " ") return;
            e.preventDefault();
            if (p.id) onAdd(p.id);
            else onAddNamed(p.name, p.price, p.emoji);
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[22px]">{p.emoji}</span>
            <CirclePlus className="ic-16 t-gold" aria-hidden="true" />
          </div>
          <div className="text-sm font-bold c-text">{p.name}</div>
          <div className="text-[10px] mb-1.5 t-muted">{p.sub}</div>
          <div className="text-sm font-black gt">{cur(p.price)}</div>
        </div>
      ))}
    </HScroll>
  </div>
);

export default PosPlanShortcuts;

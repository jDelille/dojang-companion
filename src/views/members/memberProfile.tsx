import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Cake,
  Calendar,
  Clock,
  Crown,
  Droplet,
  ExternalLink,
  Flame,
  Hash,
  History,
  Mail,
  MapPin,
  MessageCircle,
  MoreVertical,
  Phone,
  PhoneCall,
  Pencil,
  Plus,
  RefreshCw,
  Repeat,
  Ruler,
  Snowflake,
  DollarSign,
  Trash2,
  User,
  VenusAndMars,
  Weight,
} from "lucide-react";
import { all_routes } from "../../routes/all_routes";
import type { Member } from "../../types/members";
import { MEMBERS, PLAN_PRICE, MEMBER_STATUS_BADGE } from "../../utils/json/membersData";
import { moneyWhole } from "../../utils/formatUtils";
import useMembers from "./useMembers";
import Modal from "../../components/common/Modal";
import RowMenu from "../../components/common/rowMenu";

/*
   Member Profile — ported from tailwind/src/member-profile.html and
   assets/js/member-profile.js. A standalone tabbed page (Overview /
   Attendance / Payments / Fitness Plan / Notes), linked from
   ViewMemberModal's "View Full Profile".
*/

type TabKey = "overview" | "attendance" | "payments" | "fitness" | "notes";

const TABS: { key: TabKey; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "attendance", label: "Attendance" },
  { key: "payments", label: "Payments" },
  { key: "fitness", label: "Fitness Plan" },
  { key: "notes", label: "Notes" },
];

/* Deterministic pseudo-heatmap, matches buildHeatmap()'s (i*37)%5 formula. */
const HEATMAP = Array.from({ length: 84 }, (_, i) => {
  const lvl = (i * 37) % 5;
  return lvl === 0 ? "hc-0" : `hc-${Math.min(3, lvl - 1)}`;
});

type Tone = "green" | "gold" | "indigo";
const TL_CLASS: Record<Tone, string> = { green: "tl-green", gold: "tl-gold", indigo: "tl-indigo" };

const CHECKINS: { day: string; time: string; dur: string; tone: Tone }[] = [
  { day: "Today", time: "06:42 AM", dur: "1h 20m", tone: "green" },
  { day: "Yesterday", time: "07:05 AM", dur: "55m", tone: "gold" },
  { day: "Jul 12", time: "06:30 AM", dur: "1h 10m", tone: "green" },
  { day: "Jul 11", time: "08:15 PM", dur: "45m", tone: "indigo" },
  { day: "Jul 10", time: "06:50 AM", dur: "1h 05m", tone: "green" },
  { day: "Jul 08", time: "07:20 AM", dur: "50m", tone: "gold" },
  { day: "Jul 06", time: "06:38 AM", dur: "1h 15m", tone: "green" },
  { day: "Jul 05", time: "07:52 AM", dur: "40m", tone: "indigo" },
  { day: "Jul 03", time: "06:45 AM", dur: "1h 00m", tone: "green" },
];

type Payment = {
  inv: string;
  desc: string;
  date: string;
  method: string;
  amount: number;
};

const INITIAL_PAYMENTS: Payment[] = [
  { inv: "INV-2026-118", desc: "Gold Annual Renewal", date: "Jul 21, 2025", method: "Card", amount: 449 },
  { inv: "INV-2026-092", desc: "Personal Training x10", date: "Jun 02, 2026", method: "Apple Pay", amount: 499 },
  { inv: "INV-2026-071", desc: "Whey Protein 2 lb", date: "May 18, 2026", method: "Cash", amount: 54.99 },
  { inv: "INV-2026-045", desc: "Yoga Add-on", date: "Apr 20, 2026", method: "Apple Pay", amount: 75 },
  { inv: "INV-2026-020", desc: "Locker Rental", date: "Mar 15, 2026", method: "Card", amount: 25 },
];

const WORKOUT = [
  { name: "Barbell Bench Press", sets: "4 × 8–10" },
  { name: "Incline DB Press", sets: "3 × 10–12" },
  { name: "Cable Fly", sets: "3 × 12–15" },
  { name: "Tricep Pushdown", sets: "3 × 12" },
];

const DIET = [
  { slot: "Breakfast", name: "Egg whites + oats", kcal: 340 },
  { slot: "Lunch", name: "Grilled chicken salad", kcal: 480 },
  { slot: "Snack", name: "Greek yogurt + berries", kcal: 220 },
  { slot: "Dinner", name: "Fish + steamed veggies", kcal: 560 },
];

type Note = { author: string; role: string; text: string; when: string };

const INITIAL_NOTES: Note[] = [
  {
    author: "Daniel Foster",
    role: "Trainer",
    text: "Great progress on upper body strength. Increase bench weight next week.",
    when: "2 days ago",
  },
  {
    author: "Front Desk",
    role: "Reception",
    text: "Requested locker #14 near the entrance. Assigned.",
    when: "1 week ago",
  },
];

const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

const MemberProfile = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const page = useMembers();

  const member = useMemo<Member>(() => {
    const id = searchParams.get("id");
    return page.members.find((m) => m.id === id) ?? MEMBERS[0];
  }, [searchParams, page.members]);

  const [tab, setTab] = useState<TabKey>("overview");
  const [payments, setPayments] = useState<Payment[]>(INITIAL_PAYMENTS);
  const [notes, setNotes] = useState<Note[]>(INITIAL_NOTES);
  const [noteInput, setNoteInput] = useState("");

  const [renewOpen, setRenewOpen] = useState(false);
  const [freezeOpen, setFreezeOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [payDesc, setPayDesc] = useState("");
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState("Cash");

  const lifetime = useMemo(() => payments.reduce((s, p) => s + p.amount, 0), [payments]);
  const frozen = member.status === "Frozen";

  const addNote = () => {
    const value = noteInput.trim();
    if (!value) return;
    setNotes((prev) => [{ author: "Nathan Reeves", role: "Admin", text: value, when: "Just now" }, ...prev]);
    setNoteInput("");
  };

  const recordPayment = () => {
    const amt = parseFloat(payAmount);
    if (!(amt > 0)) return;
    const n = 119 + payments.length;
    setPayments((prev) => [
      { inv: `INV-2026-${n}`, desc: payDesc.trim() || "Manual payment", date: "Jul 14, 2026", method: payMethod, amount: amt },
      ...prev,
    ]);
    setPayAmount("");
    setPayDesc("");
    setPaymentOpen(false);
  };

  const confirmDelete = () => {
    page.removeMember(member.id);
    setDeleteOpen(false);
    router.push(all_routes.members);
  };

  return (
    <div id="section-member-profile" className="section active-section">
      {/* Back + actions */}
      <div className="flex items-center justify-between mb-4">
        <Link
          href={all_routes.members}
          className="inline-flex items-center gap-2 text-sm font-semibold c-dim hover:text-[var(--text)] transition-colors"
        >
          <ArrowLeft className="w-[15px] h-[15px]" aria-hidden="true" />
          Back to Members
        </Link>
        <div className="flex items-center gap-2">
          <Link href={all_routes.chatApp} className="btn-ghost flex items-center gap-2 px-3.5 py-2 text-sm">
            <MessageCircle className="w-[14px] h-[14px]" aria-hidden="true" />
            Message
          </Link>
          <button
            type="button"
            className="btn-ghost flex items-center gap-2 px-3.5 py-2 text-sm"
            onClick={() => setRenewOpen(true)}
          >
            <RefreshCw className="w-[14px] h-[14px]" aria-hidden="true" />
            Renew
          </button>
          <button type="button" className="btn-gold flex items-center gap-2 px-4 py-2 text-sm">
            <Pencil className="w-[14px] h-[14px]" aria-hidden="true" />
            Edit
          </button>
          <RowMenu
            triggerClassName="hbtn"
            triggerTitle="More actions"
            trigger={<MoreVertical className="w-[15px] h-[15px]" aria-hidden="true" />}
          >
            <button type="button" className="dropdown-item">
              <Repeat className="w-4 h-4" aria-hidden="true" />
              Change Membership
            </button>
            <button type="button" className="dropdown-item" onClick={() => setFreezeOpen(true)}>
              <Snowflake className="w-4 h-4" aria-hidden="true" />
              Freeze Membership
            </button>
            <button type="button" className="dropdown-item" onClick={() => setPaymentOpen(true)}>
              <DollarSign className="w-4 h-4" aria-hidden="true" />
              Record Payment
            </button>
            <button type="button" className="dropdown-item" onClick={() => setHistoryOpen(true)}>
              <History className="w-4 h-4" aria-hidden="true" />
              Check-in History
            </button>
            <div className="menu-sep" />
            <button type="button" className="dropdown-item danger" onClick={() => setDeleteOpen(true)}>
              <Trash2 className="w-4 h-4" aria-hidden="true" />
              Delete Member
            </button>
          </RowMenu>
        </div>
      </div>

      {/* Profile header card */}
      <div className="glass-card">
        <div className="px-6 py-5">
          <div className="flex flex-col md:flex-row md:items-end gap-4">
            <div className={`avatar-xl ${member.av}`}>{member.ini}</div>
            <div className="flex-1 md:pb-2">
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-black c-text">
                  {member.first} {member.last}
                </h2>
                <span className={`badge ${MEMBER_STATUS_BADGE[member.status]}`}>
                  <span className="dot" />
                  {member.status}
                </span>
                <span className="badge badge-gold">
                  <Crown className="w-[11px] h-[11px]" aria-hidden="true" />
                  {member.planLabel}
                </span>
              </div>
              <div className="text-[13px] c-dim mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
                <span className="flex items-center gap-1.5">
                  <Hash className="w-[12px] h-[12px]" aria-hidden="true" />
                  {member.id}
                </span>
                <span className="flex items-center gap-1.5">
                  <Mail className="w-[12px] h-[12px]" aria-hidden="true" />
                  {member.email}
                </span>
                <span className="flex items-center gap-1.5">
                  <Phone className="w-[12px] h-[12px]" aria-hidden="true" />
                  {member.phone}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-[12px] h-[12px]" aria-hidden="true" />
                  Austin
                </span>
              </div>
            </div>
            <div className="flex items-center gap-6 md:pb-2">
              <div className="text-center">
                <div className="text-lg font-black gt leading-none">18</div>
                <div className="text-[10px] c-dim2 font-bold uppercase tracking-wider mt-1">Days Left</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-black c-text leading-none">{member.checkins}</div>
                <div className="text-[10px] c-dim2 font-bold uppercase tracking-wider mt-1">Check-ins</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-black c-text leading-none">${(lifetime / 1000).toFixed(1)}k</div>
                <div className="text-[10px] c-dim2 font-bold uppercase tracking-wider mt-1">Lifetime</div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-6 mt-5 border-t pt-1 overflow-x-auto bd-border">
            {TABS.map((t) => (
              <div
                key={t.key}
                className={tab === t.key ? "prof-tab active" : "prof-tab"}
                role="button"
                tabIndex={0}
                onClick={() => setTab(t.key)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") setTab(t.key);
                }}
              >
                {t.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5">
        {tab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 space-y-5">
              <div className="glass-card p-5">
                <h3 className="font-bold c-text sec-title mb-3">Personal Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
                  <div className="info-row">
                    <User aria-hidden="true" />
                    <span className="k">Full Name</span>
                    <span className="v">
                      {member.first} {member.last}
                    </span>
                  </div>
                  <div className="info-row">
                    <Cake aria-hidden="true" />
                    <span className="k">Date of Birth</span>
                    <span className="v">Mar 14, 1995</span>
                  </div>
                  <div className="info-row">
                    <VenusAndMars aria-hidden="true" />
                    <span className="k">Gender</span>
                    <span className="v">Female</span>
                  </div>
                  <div className="info-row">
                    <Ruler aria-hidden="true" />
                    <span className="k">Height</span>
                    <span className="v">5'5"</span>
                  </div>
                  <div className="info-row">
                    <Weight aria-hidden="true" />
                    <span className="k">Weight</span>
                    <span className="v">136 lbs</span>
                  </div>
                  <div className="info-row">
                    <Droplet aria-hidden="true" />
                    <span className="k">Blood Group</span>
                    <span className="v">O+</span>
                  </div>
                  <div className="info-row">
                    <PhoneCall aria-hidden="true" />
                    <span className="k">Emergency</span>
                    <span className="v">(305) 555-0141</span>
                  </div>
                  <div className="info-row">
                    <Calendar aria-hidden="true" />
                    <span className="k">Joined</span>
                    <span className="v">Jan 12, 2024</span>
                  </div>
                </div>
              </div>

              <div className="gold-border-card p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold c-text sec-title">Membership Plan</h3>
                  <span className={`badge ${MEMBER_STATUS_BADGE[member.status]}`}>
                    <span className="dot" />
                    {member.status}
                  </span>
                </div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="icon-box ic-gold" style={{ width: 52, height: 52 }}>
                    <Crown className="w-[24px] h-[24px] c-gold" aria-hidden="true" />
                  </div>
                  <div className="flex-1">
                    <div className="text-base font-black c-text">
                      {member.planLabel} · {moneyWhole(PLAN_PRICE[member.planLabel] ?? 0)}
                    </div>
                    <div className="text-[12px] c-dim">Unlimited access · PT included · Locker #14</div>
                  </div>
                </div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] c-dim2 font-bold uppercase tracking-wider">Validity</span>
                  <span className="text-[11px] c-gold font-bold">18 of 365 days left</span>
                </div>
                <div className="prog-track">
                  <div className="prog-bar" style={{ width: "95%" }} />
                </div>
                <div className="flex items-center justify-between mt-2 text-[11px] c-dim">
                  <span>Started Jul 21, 2025</span>
                  <span>Expires {member.expiresDisp}</span>
                </div>
                <div className="flex gap-2 mt-4 pt-4 bd-t">
                  <button
                    type="button"
                    className="btn-ghost flex-1 py-2 text-xs flex items-center justify-center gap-1.5"
                  >
                    <Repeat className="w-[13px] h-[13px]" aria-hidden="true" />
                    Change Plan
                  </button>
                  <button
                    type="button"
                    className="btn-ghost flex-1 py-2 text-xs flex items-center justify-center gap-1.5"
                    onClick={() => setRenewOpen(true)}
                  >
                    <RefreshCw className="w-[13px] h-[13px]" aria-hidden="true" />
                    Renew
                  </button>
                  <button
                    type="button"
                    className="btn-ghost flex-1 py-2 text-xs flex items-center justify-center gap-1.5"
                    onClick={() => setFreezeOpen(true)}
                  >
                    <Snowflake className="w-[13px] h-[13px]" aria-hidden="true" />
                    Freeze
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <div className="glass-card p-5 text-center">
                <h3 className="font-bold c-text sec-title mb-4 text-left">Engagement Score</h3>
                <div className="ring eng-ring mx-auto">
                  <div className="eng-ring-inner" />
                  <div className="val">
                    <span className="text-2xl font-black gt leading-none">84</span>
                    <span className="text-[10px] c-dim2 font-bold">/ 100</span>
                  </div>
                </div>
                <div className="text-[12px] c-green font-semibold mt-3">Highly engaged 🔥</div>
                <div className="text-[11px] c-dim mt-1">Above 78% of members</div>
              </div>

              <div className="glass-card p-5">
                <h3 className="font-bold c-text sec-title mb-4">Quick Stats</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="icon-box ic-green" style={{ width: 34, height: 34 }}>
                      <Flame className="w-[15px] h-[15px] c-green" aria-hidden="true" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-bold c-text">12 day streak</div>
                      <div className="text-[11px] c-dim">Current attendance streak</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="icon-box ic-purple" style={{ width: 34, height: 34 }}>
                      <Hash className="w-[15px] h-[15px] c-purple" aria-hidden="true" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-bold c-text">26 PT sessions</div>
                      <div className="text-[11px] c-dim">With {member.trainer}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="icon-box ic-cyan" style={{ width: 34, height: 34 }}>
                      <Clock className="w-[15px] h-[15px] c-cyan" aria-hidden="true" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-bold c-text">Peak: 6–8 AM</div>
                      <div className="text-[11px] c-dim">Most frequent visit time</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === "attendance" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 glass-card p-5">
              <h3 className="font-bold c-text sec-title mb-4">Attendance Heatmap · Last 12 weeks</h3>
              <div className="flex flex-wrap gap-1.5">
                {HEATMAP.map((cls, i) => (
                  <span key={i} className={`heat-cell ${cls}`} title={`Day ${i + 1}`} />
                ))}
              </div>
              <div className="flex items-center justify-end gap-2 mt-4 text-[10px] c-dim2">
                <span>Less</span>
                <span className="heat-cell hc-0" />
                <span className="heat-cell hc-1" />
                <span className="heat-cell hc-2" />
                <span className="heat-cell hc-3" />
                <span>More</span>
              </div>
            </div>
            <div className="glass-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold c-text sec-title">Recent Check-ins</h3>
                <button
                  type="button"
                  className="btn-ghost px-2.5 py-1.5 text-[11px] flex items-center gap-1.5"
                  onClick={() => setHistoryOpen(true)}
                >
                  <History className="w-[12px] h-[12px]" aria-hidden="true" />
                  Full History
                </button>
              </div>
              <div className="timeline">
                {CHECKINS.slice(0, 6).map((c) => (
                  <div key={c.day + c.time} className="tl-item">
                    <span className={`tl-dot ${TL_CLASS[c.tone]}`} />
                    <div className="text-[13px] font-semibold c-text">
                      {c.day} · {c.time}
                    </div>
                    <div className="text-[11px] c-dim">Session · {c.dur}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "payments" && (
          <div className="glass-card overflow-hidden">
            <div className="flex items-center justify-between p-4 pb-3">
              <h3 className="font-bold c-text sec-title">Payment History</h3>
              <div className="flex items-center gap-3">
                <span className="text-[13px] c-dim">
                  Lifetime: <span className="c-gold font-bold">{moneyWhole(lifetime)}</span>
                </span>
                <button
                  type="button"
                  className="btn-gold px-3 py-1.5 text-xs flex items-center gap-1.5"
                  onClick={() => setPaymentOpen(true)}
                >
                  <Plus className="w-[12px] h-[12px]" aria-hidden="true" />
                  Record Payment
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="data-table min-w-[640px]">
                <thead>
                  <tr>
                    <th>Invoice</th>
                    <th>Description</th>
                    <th>Date</th>
                    <th>Method</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p.inv}>
                      <td className="font-mono text-xs font-bold c-gold">{p.inv}</td>
                      <td className="c-text2">{p.desc}</td>
                      <td className="text-[12px] c-dim">{p.date}</td>
                      <td className="text-[13px]">{p.method}</td>
                      <td className="font-bold c-text">{moneyWhole(p.amount)}</td>
                      <td>
                        <span className="badge badge-present">
                          <span className="dot" />
                          Paid
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "fitness" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="glass-card p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="icon-box ic-gold" style={{ width: 44, height: 44 }}>
                  <Hash className="w-[20px] h-[20px] c-gold" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-bold c-text">Hypertrophy Builder</h3>
                  <div className="text-[11px] c-dim">Workout plan · Intermediate · 5 days/wk</div>
                </div>
              </div>
              <div className="space-y-2">
                {WORKOUT.map((w, i) => (
                  <div key={w.name} className="flex items-center justify-between p-2.5 rounded-lg row-soft">
                    <div className="flex items-center gap-2.5">
                      <span className="text-[11px] font-black c-gold" style={{ width: 18 }}>
                        {i + 1}
                      </span>
                      <span className="text-[13px] c-text2">{w.name}</span>
                    </div>
                    <span className="text-[12px] c-dim">{w.sets}</span>
                  </div>
                ))}
              </div>
              <Link
                href={all_routes.workouts}
                className="btn-ghost w-full mt-4 py-2 text-xs flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-[12px] h-[12px]" aria-hidden="true" />
                View Full Plan
              </Link>
            </div>
            <div className="glass-card p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="icon-box ic-green" style={{ width: 44, height: 44 }}>
                  <Hash className="w-[20px] h-[20px] c-green" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-bold c-text">Lean Cut 1600</h3>
                  <div className="text-[11px] c-dim">Diet plan · Weight Loss · 1600 kcal</div>
                </div>
              </div>
              <div className="space-y-2">
                {DIET.map((d) => (
                  <div key={d.slot} className="flex items-center justify-between p-2.5 rounded-lg row-soft">
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-wider c-dim2">{d.slot}</div>
                      <div className="text-[13px] c-text2">{d.name}</div>
                    </div>
                    <span className="text-[12px] font-bold c-gold">{d.kcal} kcal</span>
                  </div>
                ))}
              </div>
              <Link
                href={all_routes.diet}
                className="btn-ghost w-full mt-4 py-2 text-xs flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-[12px] h-[12px]" aria-hidden="true" />
                View Full Plan
              </Link>
            </div>
          </div>
        )}

        {tab === "notes" && (
          <div className="glass-card p-5">
            <h3 className="font-bold c-text sec-title mb-4">Staff Notes</h3>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                className="fp-input py-2.5 text-sm"
                placeholder="Add a note about this member…"
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addNote();
                  }
                }}
              />
              <button
                type="button"
                className="btn-gold px-4 py-2.5 text-sm flex items-center gap-2"
                onClick={addNote}
              >
                <Plus className="w-[13px] h-[13px]" aria-hidden="true" />
                Add
              </button>
            </div>
            <div className="space-y-3">
              {notes.map((n, i) => (
                <div key={i} className="flex gap-3 p-3 rounded-xl note-card">
                  <div className="av av-gold" style={{ width: 32, height: 32 }}>
                    {initialsOf(n.author)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-bold c-text">{n.author}</span>
                      <span className="text-[10px] c-dim2 px-1.5 py-0.5 rounded-sm role-pill">{n.role}</span>
                      <span className="text-[11px] c-dim2 ml-auto">{n.when}</span>
                    </div>
                    <div className="text-[13px] c-dim mt-1 leading-relaxed">{n.text}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ══════════ MODALS ══════════ */}
      <Modal open={renewOpen} onClose={() => setRenewOpen(false)} title="Renew Plan">
        <div className="gold-border-card p-3 mb-4">
          <div className="text-sm font-bold c-text">
            {member.planLabel} · {moneyWhole(PLAN_PRICE[member.planLabel] ?? 0)}
          </div>
          <div className="text-[11px] c-dim">Expires {member.expiresDisp} · 18 days left</div>
        </div>
        <div className="flex gap-3">
          <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={() => setRenewOpen(false)}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-gold flex-1 py-2.5 text-sm"
            onClick={() => {
              page.renew(member.id, member.planLabel);
              setRenewOpen(false);
            }}
          >
            Renew &amp; Collect
          </button>
        </div>
      </Modal>

      <Modal open={freezeOpen} onClose={() => setFreezeOpen(false)} title="Freeze Membership">
        <p className="text-[13px] c-dim mb-4">Freeze {member.first}&apos;s membership. Their expiry will be extended by the freeze duration.</p>
        <div className="flex gap-3">
          <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={() => setFreezeOpen(false)}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-gold flex-1 py-2.5 text-sm"
            onClick={() => {
              page.setStatusOf(member.id, frozen ? "Active" : "Frozen");
              setFreezeOpen(false);
            }}
          >
            {frozen ? "Unfreeze Membership" : "Freeze Membership"}
          </button>
        </div>
      </Modal>

      <Modal open={paymentOpen} onClose={() => setPaymentOpen(false)} title="Record Payment">
        <div className="mb-3">
          <label className="f-label">Description</label>
          <input
            type="text"
            className="fp-input py-2.5 text-sm"
            placeholder="e.g. Personal Training x5"
            value={payDesc}
            onChange={(e) => setPayDesc(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="f-label">Amount ($)</label>
            <input
              type="number"
              className="fp-input py-2.5 text-sm"
              placeholder="0"
              value={payAmount}
              onChange={(e) => setPayAmount(e.target.value)}
            />
          </div>
          <div>
            <label className="f-label">Method</label>
            <select className="fp-input py-2.5 text-sm" value={payMethod} onChange={(e) => setPayMethod(e.target.value)}>
              <option>Cash</option>
              <option>Card</option>
              <option>Apple Pay</option>
              <option>Wallet</option>
            </select>
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={() => setPaymentOpen(false)}>
            Cancel
          </button>
          <button type="button" className="btn-gold flex-1 py-2.5 text-sm" onClick={recordPayment}>
            Record Payment
          </button>
        </div>
      </Modal>

      <Modal open={historyOpen} onClose={() => setHistoryOpen(false)} title="Check-in History">
        <div className="hist-scroll space-y-2">
          {CHECKINS.map((c) => (
            <div key={c.day + c.time} className="hist-row">
              <span className={`w-2.5 h-2.5 rounded-full ${TL_CLASS[c.tone]}`} />
              <div className="flex-1">
                <div className="text-[13px] font-semibold c-text">
                  {c.day} · {c.time}
                </div>
                <div className="text-[11px] c-dim">Gym session</div>
              </div>
              <span className="text-[12px] font-bold c-gold">{c.dur}</span>
            </div>
          ))}
        </div>
      </Modal>

      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete Member?" titleClassName="text-base text-center w-full">
        <p className="text-sm text-center mb-5 c-dim">
          This permanently removes <span className="font-semibold c-text">{member.first} {member.last}</span> and all
          associated records. This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={() => setDeleteOpen(false)}>
            Cancel
          </button>
          <button type="button" className="btn-danger flex-1 py-2.5 text-sm" onClick={confirmDelete}>
            Delete Member
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default MemberProfile;

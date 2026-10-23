import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Award,
  BadgeCheck,
  Building2,
  CalendarCheck,
  Calendar,
  ClipboardCheck,
  Clock,
  DollarSign,
  Dumbbell,
  Eye,
  Gauge,
  Hash,
  Languages,
  Mail,
  Pencil,
  Phone,
  Star,
  TrendingUp,
  UserPlus,
  Users,
  ArrowLeft,
  MessageCircle,
} from "lucide-react";
import Link from "next/link";
import { all_routes } from "../../routes/all_routes";
import { TRAINERS } from "../../utils/json/trainersData";
import { moneyWhole, initials as initialsOf } from "../../utils/formatUtils";
import { fullName } from "./useTrainers";
import useToast from "../../hooks/useToast";
import Toast from "../../components/common/Toast";
import TrainerStars from "./trainerStars";

/*
   Trainer Profile — ported from tailwind/src/trainer-profile.html and
   assets/js/trainer-profile.js. A standalone tabbed page (Overview /
   Schedule / Clients / Earnings / Reviews), distinct from the compact
   TrainerViewModal summary used elsewhere.
*/

type TabKey = "overview" | "schedule" | "clients" | "earnings" | "reviews";

const TABS: { key: TabKey; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "schedule", label: "Schedule" },
  { key: "clients", label: "Clients" },
  { key: "earnings", label: "Earnings" },
  { key: "reviews", label: "Reviews" },
];

const SKILLS = [
  { name: "Strength Training", v: 96 },
  { name: "Powerlifting", v: 92 },
  { name: "Hypertrophy", v: 88 },
  { name: "Nutrition Coaching", v: 78 },
  { name: "Mobility & Recovery", v: 70 },
];

const CERTS = ["NSCA-CSCS", "ACE-CPT", "Precision Nutrition L1", "First Aid / CPR"];

const DAYS = [
  { d: "Mon", n: 13 },
  { d: "Tue", n: 14 },
  { d: "Wed", n: 15 },
  { d: "Thu", n: 16 },
  { d: "Fri", n: 17 },
  { d: "Sat", n: 18 },
  { d: "Sun", n: 19 },
];

const SLOTS: Record<number, { time: string; label: string; color: string }[]> = {
  0: [
    { time: "06:00", label: "PT · Ashley", color: "#D4AF37" },
    { time: "08:00", label: "Strength Class", color: "#818CF8" },
    { time: "11:00", label: "PT · Tyler", color: "#D4AF37" },
  ],
  1: [
    { time: "07:00", label: "PT · Marcus", color: "#D4AF37" },
    { time: "10:00", label: "Powerlifting", color: "#818CF8" },
  ],
  2: [
    { time: "06:00", label: "PT · Ashley", color: "#D4AF37" },
    { time: "09:00", label: "PT · Jessica", color: "#D4AF37" },
    { time: "13:00", label: "Deadlift Clinic", color: "#818CF8" },
  ],
  3: [
    { time: "08:00", label: "PT · Omar", color: "#D4AF37" },
    { time: "11:00", label: "PT · Natalie", color: "#D4AF37" },
  ],
  4: [
    { time: "06:00", label: "Strength Class", color: "#818CF8" },
    { time: "09:00", label: "PT · Tyler", color: "#D4AF37" },
  ],
  5: [{ time: "10:00", label: "Weekend Bootcamp", color: "#4ADE80" }],
  6: [],
};

const CLIENTS = [
  { name: "Ashley Bennett", goal: "Muscle Gain", sessions: 26, progress: 78, next: "Today 6:00 AM" },
  { name: "Tyler Brooks", goal: "Strength", sessions: 18, progress: 62, next: "Today 11:00 AM" },
  { name: "Jessica Ramirez", goal: "Fat Loss", sessions: 12, progress: 45, next: "Wed 9:00 AM" },
  { name: "Omar Haddad", goal: "Powerlifting", sessions: 30, progress: 88, next: "Thu 8:00 AM" },
  { name: "Natalie Rivera", goal: "Toning", sessions: 8, progress: 30, next: "Thu 11:00 AM" },
];

const AV = ["av-gold", "av-purple", "av-orange", "av-cyan", "av-green"];

const EARN = [4200, 4800, 5100, 5300, 5600, 6400];
const EARN_M = ["Feb", "Mar", "Apr", "May", "Jun", "Jul"];

const REVIEWS = [
  {
    name: "Ashley Bennett",
    stars: 5,
    text: "Daniel completely changed my training. Down 18 lbs and stronger than ever!",
    when: "3 days ago",
  },
  {
    name: "Omar Haddad",
    stars: 5,
    text: "Best powerlifting coach in the city. My deadlift went from 275 to 405 lbs.",
    when: "1 week ago",
  },
  {
    name: "Jessica Ramirez",
    stars: 4,
    text: "Very knowledgeable and motivating. Sessions are always on time.",
    when: "2 weeks ago",
  },
];

const RATING_DIST = [
  { s: 5, p: 82 },
  { s: 4, p: 13 },
  { s: 3, p: 3 },
  { s: 2, p: 1 },
  { s: 1, p: 1 },
];

const StarRow = ({ n, size }: { n: number; size: number }) => (
  <>
    {Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        style={{ width: size, height: size, color: i < n ? "#D4AF37" : "#2E2E34" }}
        fill={i < n ? "#D4AF37" : "none"}
        aria-hidden="true"
      />
    ))}
  </>
);

const TrainerProfile = () => {
  const searchParams = useSearchParams();
  const { message, visible, showToast } = useToast();
  const [tab, setTab] = useState<TabKey>("overview");

  const trainer = useMemo(() => {
    const id = Number(searchParams.get("id"));
    return TRAINERS.find((t) => t.id === id) ?? TRAINERS[0];
  }, [searchParams]);

  return (
    <div id="section-trainer-profile" className="section active-section">
      {/* Back + actions */}
      <div className="flex items-center justify-between mb-4">
        <Link
          href={all_routes.trainers}
          className="inline-flex items-center gap-2 text-sm font-semibold c-dim hover:text-[var(--text)] transition-colors"
        >
          <ArrowLeft className="w-[15px] h-[15px]" aria-hidden="true" />
          Back to Trainers
        </Link>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="btn-ghost flex items-center gap-2 px-3.5 py-2 text-sm"
            onClick={() => showToast("Opening chat…")}
          >
            <MessageCircle className="w-[14px] h-[14px]" aria-hidden="true" />
            Message
          </button>
          <button
            type="button"
            className="btn-ghost flex items-center gap-2 px-3.5 py-2 text-sm"
            onClick={() => showToast("Assign a client to " + trainer.first + "…")}
          >
            <UserPlus className="w-[14px] h-[14px]" aria-hidden="true" />
            Assign Client
          </button>
          <button
            type="button"
            className="btn-gold flex items-center gap-2 px-4 py-2 text-sm"
            onClick={() => showToast("Opening trainer editor…")}
          >
            <Pencil className="w-[14px] h-[14px]" aria-hidden="true" />
            Edit
          </button>
        </div>
      </div>

      {/* Profile header */}
      <div className="cover">
        <div className="cover-grid" />
      </div>
      <div className="glass-card" style={{ marginTop: "-52px" }}>
        <div className="px-6 pb-5">
          <div className="flex flex-col md:flex-row md:items-end gap-4" style={{ marginTop: "-48px" }}>
            <div className="avatar-xl">{trainer.initials}</div>
            <div className="flex-1 md:pb-2">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl font-black c-text">{fullName(trainer)}</h2>
                <span className="badge badge-active">
                  <span className="dot" />
                  {trainer.online ? "Available" : "Off Duty"}
                </span>
                <span className="badge badge-gold-custom">
                  <Award className="w-[11px] h-[11px]" aria-hidden="true" />
                  {trainer.level}
                </span>
              </div>
              <div className="text-[13px] c-dim mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
                <span className="flex items-center gap-1.5">
                  <Hash className="w-[12px] h-[12px]" aria-hidden="true" />
                  TRN-{String(trainer.id).padStart(3, "0")}
                </span>
                <span className="flex items-center gap-1.5">
                  <Mail className="w-[12px] h-[12px]" aria-hidden="true" />
                  {trainer.email}
                </span>
                <span className="flex items-center gap-1.5">
                  <Phone className="w-[12px] h-[12px]" aria-hidden="true" />
                  {trainer.phone}
                </span>
                <span className="flex items-center gap-1.5">
                  <Dumbbell className="w-[12px] h-[12px]" aria-hidden="true" />
                  {trainer.spec}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-6 md:pb-2">
              <div className="text-center">
                <div className="text-lg font-black gt leading-none flex items-center gap-1">
                  <Star className="w-[14px] h-[14px]" fill="currentColor" aria-hidden="true" />
                  {trainer.rating.toFixed(1)}
                </div>
                <div className="text-[10px] c-dim2 font-bold uppercase tracking-wider mt-1">Rating</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-black c-text leading-none">{trainer.members}</div>
                <div className="text-[10px] c-dim2 font-bold uppercase tracking-wider mt-1">Clients</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-black c-text leading-none">6 yrs</div>
                <div className="text-[10px] c-dim2 font-bold uppercase tracking-wider mt-1">Experience</div>
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
                <h3 className="font-bold c-text sec-title mb-3">About</h3>
                <p className="text-[13px] c-dim leading-relaxed mb-4">
                  Certified strength &amp; conditioning specialist with 6+ years transforming clients
                  through evidence-based training. Specialises in hypertrophy, powerlifting, and athletic
                  performance. Known for a motivating, no-nonsense coaching style.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
                  <div className="info-row">
                    <Dumbbell aria-hidden="true" />
                    <span className="k">Specialty</span>
                    <span className="font-semibold">{trainer.spec}</span>
                  </div>
                  <div className="info-row">
                    <Languages aria-hidden="true" />
                    <span className="k">Languages</span>
                    <span className="font-semibold">English, Spanish</span>
                  </div>
                  <div className="info-row">
                    <Clock aria-hidden="true" />
                    <span className="k">Shift</span>
                    <span className="font-semibold">5 AM – 2 PM</span>
                  </div>
                  <div className="info-row">
                    <DollarSign aria-hidden="true" />
                    <span className="k">PT Rate</span>
                    <span className="font-semibold">$50 / session</span>
                  </div>
                  <div className="info-row">
                    <Calendar aria-hidden="true" />
                    <span className="k">Joined</span>
                    <span className="font-semibold">Mar 10, 2020</span>
                  </div>
                  <div className="info-row">
                    <Building2 aria-hidden="true" />
                    <span className="k">Branch</span>
                    <span className="font-semibold">Austin HQ</span>
                  </div>
                </div>
              </div>

              <div className="glass-card p-5">
                <h3 className="font-bold c-text sec-title mb-4">Expertise</h3>
                <div className="space-y-3">
                  {SKILLS.map((s) => (
                    <div key={s.name}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[13px] c-text2 font-semibold">{s.name}</span>
                        <span className="text-[12px] font-bold c-gold">{s.v}%</span>
                      </div>
                      <div className="skill-track">
                        <div className="skill-fill" style={{ width: `${s.v}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <div className="glass-card p-5">
                <h3 className="font-bold c-text sec-title mb-4">This Week</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="icon-box ic-gold" style={{ width: 34, height: 34 }}>
                      <CalendarCheck className="w-[15px] h-[15px] c-gold" aria-hidden="true" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-bold c-text">{trainer.sessions} sessions</div>
                      <div className="text-[11px] c-dim">Booked this week</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="icon-box ic-green" style={{ width: 34, height: 34 }}>
                      <Users className="w-[15px] h-[15px] c-green" aria-hidden="true" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-bold c-text">5 classes</div>
                      <div className="text-[11px] c-dim">Group sessions led</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="icon-box ic-cyan" style={{ width: 34, height: 34 }}>
                      <Gauge className="w-[15px] h-[15px] c-cyan" aria-hidden="true" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-bold c-text">92% utilisation</div>
                      <div className="text-[11px] c-dim">Of available slots</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="glass-card p-5">
                <h3 className="font-bold c-text sec-title mb-4">Certifications</h3>
                <div className="flex flex-wrap gap-2">
                  {CERTS.map((c) => (
                    <span key={c} className="cert-badge">
                      <BadgeCheck className="w-[13px] h-[13px] c-gold" aria-hidden="true" />
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === "schedule" && (
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold c-text sec-title">Weekly Schedule</h3>
              <span className="text-[11px] c-dim">July 13–19, 2026</span>
            </div>
            <div className="overflow-x-auto">
              <div className="sched-grid">
                {DAYS.map((day, i) => {
                  const slots = SLOTS[i] ?? [];
                  return (
                    <div key={day.d} className="sched-day">
                      <div className="text-center mb-2">
                        <div className="text-[10px] font-bold c-dim2 uppercase">{day.d}</div>
                        <div className="text-[14px] font-black c-text">{day.n}</div>
                      </div>
                      {slots.length === 0 ? (
                        <div className="text-[10px] c-dim2 text-center pt-4">Off</div>
                      ) : (
                        slots.map((s) => (
                          <div
                            key={s.time}
                            className="sched-slot"
                            style={{ background: s.color + "1f", color: s.color }}
                          >
                            <b>{s.time}</b>
                            <br />
                            {s.label}
                          </div>
                        ))
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {tab === "clients" && (
          <div className="glass-card overflow-hidden">
            <div className="flex items-center justify-between p-4 pb-3">
              <h3 className="font-bold c-text sec-title">Assigned Clients</h3>
              <span className="text-[13px] c-dim">
                <span className="c-gold font-bold">{trainer.members}</span> active
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="data-table min-w-[640px]">
                <thead>
                  <tr>
                    <th>Client</th>
                    <th>Goal</th>
                    <th>Sessions</th>
                    <th>Progress</th>
                    <th>Next Session</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {CLIENTS.map((c, i) => (
                    <tr key={c.name}>
                      <td>
                        <div className="flex items-center gap-2.5">
                          <div className={`av ${AV[i % AV.length]}`} style={{ width: 32, height: 32 }}>
                            {initialsOf(c.name)}
                          </div>
                          <span className="font-semibold c-text">{c.name}</span>
                        </div>
                      </td>
                      <td>{c.goal}</td>
                      <td className="font-bold c-text">{c.sessions}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="skill-track" style={{ width: 70 }}>
                            <div className="skill-fill" style={{ width: `${c.progress}%` }} />
                          </div>
                          <span className="text-[11px] font-bold c-gold">{c.progress}%</span>
                        </div>
                      </td>
                      <td className="text-[12px] c-dim">{c.next}</td>
                      <td className="text-right">
                        <button
                          type="button"
                          className="icon-btn view"
                          title="View"
                          onClick={() => showToast("Opening " + c.name + "…")}
                        >
                          <Eye className="w-[15px] h-[15px]" aria-hidden="true" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "earnings" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 glass-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold c-text sec-title">Earnings · Last 6 Months</h3>
                <span className="text-[11px] c-dim">Monthly</span>
              </div>
              <div className="flex items-end gap-3" style={{ height: 160 }}>
                {EARN.map((v, i) => {
                  const max = Math.max(...EARN) || 1;
                  const h = Math.round((v / max) * 100);
                  const cur = i === EARN.length - 1;
                  return (
                    <div
                      key={EARN_M[i]}
                      style={{
                        flex: 1,
                        height: `${h}%`,
                        borderRadius: "5px 5px 0 0",
                        background: cur
                          ? "linear-gradient(180deg,#F4D03F,#D4AF37)"
                          : "linear-gradient(180deg,#D4AF37,#B8860B)",
                      }}
                      title={moneyWhole(v)}
                    />
                  );
                })}
              </div>
              <div className="flex items-center justify-between mt-2 text-[10px] c-dim2 font-semibold">
                {EARN_M.map((m) => (
                  <span key={m}>{m}</span>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <div className="gold-border-card p-5 text-center">
                <div className="text-[11px] c-dim2 font-bold uppercase tracking-wider">This Month</div>
                <div className="text-3xl font-black gt mt-1">{moneyWhole(EARN[EARN.length - 1])}</div>
                <div className="text-[12px] c-green font-semibold mt-1 flex items-center justify-center gap-1">
                  <TrendingUp className="w-[13px] h-[13px]" aria-hidden="true" />
                  +14% vs last month
                </div>
              </div>
              <div className="glass-card p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] c-dim">Base Salary</span>
                  <span className="text-[13px] font-bold c-text">$4,200</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[13px] c-dim">PT Commission</span>
                  <span className="text-[13px] font-bold c-green">+$1,550</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[13px] c-dim">Incentives</span>
                  <span className="text-[13px] font-bold c-green">+$650</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === "reviews" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="glass-card p-5 text-center">
              <div className="text-5xl font-black gt leading-none">{trainer.rating.toFixed(1)}</div>
              <div className="flex items-center justify-center gap-0.5 mt-2">
                <StarRow n={5} size={16} />
              </div>
              <div className="text-[12px] c-dim mt-2">Based on 128 reviews</div>
              <div className="mt-5 space-y-2">
                {RATING_DIST.map((r) => (
                  <div key={r.s} className="flex items-center gap-2">
                    <span className="text-[11px] c-dim2 font-bold" style={{ width: 10 }}>
                      {r.s}
                    </span>
                    <div className="skill-track flex-1">
                      <div className="skill-fill" style={{ width: `${r.p}%` }} />
                    </div>
                    <span className="text-[11px] c-dim2" style={{ width: 30, textAlign: "right" }}>
                      {r.p}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:col-span-2 space-y-3">
              {REVIEWS.map((r, i) => (
                <div key={r.name} className="glass-card p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`av ${AV[i % AV.length]}`} style={{ width: 34, height: 34 }}>
                      {initialsOf(r.name)}
                    </div>
                    <div className="flex-1">
                      <div className="text-[13px] font-bold c-text">{r.name}</div>
                      <div className="flex items-center gap-0.5 mt-0.5">
                        <StarRow n={r.stars} size={12} />
                      </div>
                    </div>
                    <span className="text-[11px] c-dim2">{r.when}</span>
                  </div>
                  <p className="text-[13px] c-dim leading-relaxed">{r.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Toast message={message} visible={visible} />
    </div>
  );
};

export default TrainerProfile;

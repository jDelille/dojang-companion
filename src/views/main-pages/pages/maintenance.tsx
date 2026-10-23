import { useEffect, useState } from "react";
import {
  Bell,
  Circle,
  CheckCircle2,
  Cog,
  Dumbbell,
  Loader,
  Mail,
  RefreshCw,
  Settings,
  Wrench,
} from "lucide-react";
import useToast from "../../../hooks/useToast";
import Toast from "../../../components/common/Toast";

/*
   Maintenance — ported from tailwind/src/maintenance.html and
   assets/js/maintenance.js. A chromeless scheduled-maintenance page with a
   live countdown, static upgrade-progress panel, and notify/retry actions.
*/

const START_SECONDS = 45 * 60;

const TASKS: { icon: typeof CheckCircle2; label: string; status: string; tone: string }[] = [
  { icon: CheckCircle2, label: "Database optimization", status: "Done", tone: "c-green" },
  { icon: CheckCircle2, label: "Security patches applied", status: "Done", tone: "c-green" },
  { icon: Loader, label: "Deploying new POS engine", status: "In progress", tone: "c-gold" },
  { icon: Circle, label: "Final health checks", status: "Queued", tone: "c-dim2" },
];

const SOCIALS = [
  { label: "Twitter / X", icon: Circle },
  { label: "Instagram", icon: Circle },
  { label: "Facebook", icon: Circle },
  { label: "LinkedIn", icon: Circle },
];

const pad = (n: number) => String(Math.max(0, n)).padStart(2, "0");

const Maintenance = () => {
  const { message, visible, showToast } = useToast();
  const [remaining, setRemaining] = useState(START_SECONDS);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      setRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = Math.floor(remaining / 3600);
  const minutes = Math.floor((remaining % 3600) / 60);
  const seconds = remaining % 60;

  const submitNotify = (e: React.FormEvent) => {
    e.preventDefault();
    const value = email.trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)) {
      showToast("Enter a valid email");
      return;
    }
    setEmail("");
    showToast("You're on the list — we'll email you!");
  };

  return (
    <div className="mt-wrap">
      <div className="relative z-10 flex items-center gap-3 mb-6">
        <div className="logo-badge w-10 h-10 rounded-xl flex items-center justify-center">
          <Dumbbell className="size-px-20 c-dark" aria-hidden="true" />
        </div>
        <div className="text-base font-black c-text">
          Dreams <span className="gt">Gym</span>
        </div>
      </div>

      <div className="relative z-10 emblem">
        <div className="ring" />
        <div className="ring2" />
        <div className="core">
          <Wrench className="size-px-30 c-dark" aria-hidden="true" />
        </div>
        <span className="cog cog-a">
          <Settings className="size-px-26 c-gold" aria-hidden="true" />
        </span>
        <span className="cog cog-b">
          <Cog className="size-px-20 c-gold-dark" aria-hidden="true" />
        </span>
      </div>

      <div className="relative z-10 max-w-xl">
        <span className="badge badge-pending px-3 py-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
          Scheduled Maintenance
        </span>
        <h1 className="text-2xl md:text-3xl font-black c-text mt-4">We're upgrading the gym.</h1>
        <p className="text-sm md:text-[15px] mt-3 leading-relaxed c-muted">
          Dreams GYM is undergoing scheduled maintenance to bring you new features and a faster
          experience. We'll be back online shortly — thanks for your patience.
        </p>
      </div>

      <div className="relative z-10 mt-7">
        <div className="text-[11px] font-black uppercase tracking-wider mb-3 c-dim2">
          Estimated time remaining
        </div>
        <div className="flex items-center justify-center gap-3">
          <div className="cd-box">
            <div className="cd-num">{pad(hours)}</div>
            <div className="cd-lbl">Hours</div>
          </div>
          <div className="cd-box">
            <div className="cd-num">{pad(minutes)}</div>
            <div className="cd-lbl">Minutes</div>
          </div>
          <div className="cd-box">
            <div className="cd-num">{pad(seconds)}</div>
            <div className="cd-lbl">Seconds</div>
          </div>
        </div>
      </div>

      <div className="relative z-10 glass-panel p-5 mt-8 w-full max-w-md text-left">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold c-text">Upgrade progress</span>
          <span className="text-xs font-black c-gold">72%</span>
        </div>
        <div className="mt-track mb-5">
          <div className="mt-fill" style={{ width: "72%" }} />
        </div>

        <div className="space-y-3">
          {TASKS.map((t) => {
            const Icon = t.icon;
            const spin = t.icon === Loader;
            return (
              <div key={t.label} className="task-row">
                <Icon className={`task-ic ${t.tone}${spin ? " animate-spin-slow" : ""}`} aria-hidden="true" />
                <span className={t.status === "Queued" ? "c-dim" : "c-text2"}>{t.label}</span>
                <span className={`ml-auto text-[11px] ${t.tone}`}>{t.status}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="relative z-10 w-full max-w-md mt-8">
        <div className="text-[11px] font-black uppercase tracking-wider mb-2.5 text-left c-dim2">
          Get notified when we're back
        </div>
        <form className="flex flex-col sm:flex-row gap-2.5" onSubmit={submitNotify}>
          <div className="relative flex-1">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-px-15 c-dim2" aria-hidden="true" />
            <input
              type="email"
              className="fp-input py-2.5 pl-9 text-sm"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="btn-gold px-5 py-2.5 text-sm flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <Bell className="size-px-15" aria-hidden="true" />
            Notify Me
          </button>
        </form>
        <button
          type="button"
          className="btn-ghost w-full mt-3 py-2.5 text-sm flex items-center justify-center gap-2"
          onClick={() => showToast("Still under maintenance — hang tight!")}
        >
          <RefreshCw className="size-px-15" aria-hidden="true" />
          Check Again
        </button>
      </div>

      <div className="relative z-10 mt-9 flex flex-col items-center gap-3">
        <div className="flex items-center gap-3">
          {SOCIALS.map((s) => {
            const Icon = s.icon;
            return (
              <button
                key={s.label}
                type="button"
                className="hbtn"
                title={s.label}
                aria-label={s.label}
                onClick={() => showToast(`Opening ${s.label}...`)}
              >
                <Icon className="w-4 h-4" aria-hidden="true" />
              </button>
            );
          })}
          <a href="mailto:support@example.com" className="hbtn" title="Email" aria-label="Email">
            <Mail className="w-4 h-4" aria-hidden="true" />
          </a>
        </div>
        <p className="text-xs c-dim2">
          Follow us for live updates ·{" "}
          <a href="#" className="c-gold font-semibold hover:underline">
            status.example.com
          </a>
        </p>
      </div>

      <Toast message={message} visible={visible} />
    </div>
  );
};

export default Maintenance;

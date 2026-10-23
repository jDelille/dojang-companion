import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Bell,
  Circle,
  CreditCard,
  Dumbbell,
  Eye,
  Mail,
  ScanLine,
  ShoppingCart,
  Users,
} from "lucide-react";
import { all_routes } from "../../../routes/all_routes";
import useToast from "../../../hooks/useToast";
import Toast from "../../../components/common/Toast";

/*
   Coming Soon — ported from tailwind/src/coming-soon.html and
   assets/js/coming-soon.js. A chromeless launch-teaser page with a live
   countdown and an email notify form.
*/

/* Target: 14d 6h 32m from load, matching the template's fixed countdown. */
const START_SECONDS = ((14 * 24 + 6) * 60 + 32) * 60;

const FEATURES = [
  { icon: ShoppingCart, label: "Smart POS" },
  { icon: Users, label: "Member CRM" },
  { icon: ScanLine, label: "Fast Check-In" },
  { icon: BarChart3, label: "Live Analytics" },
  { icon: CreditCard, label: "Billing" },
];

const SOCIALS = [
  { label: "Twitter / X", icon: Circle },
  { label: "Instagram", icon: Circle },
  { label: "Facebook", icon: Circle },
  { label: "LinkedIn", icon: Circle },
];

const pad = (n: number) => String(Math.max(0, n)).padStart(2, "0");

const ComingSoon = () => {
  const { message, visible, showToast } = useToast();
  const [remaining, setRemaining] = useState(START_SECONDS);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      setRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const days = Math.floor(remaining / 86400);
  const hours = Math.floor((remaining % 86400) / 3600);
  const minutes = Math.floor((remaining % 3600) / 60);
  const seconds = remaining % 60;

  const submitNotify = (e: React.FormEvent) => {
    e.preventDefault();
    const value = email.trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)) {
      showToast("Enter a valid email address");
      return;
    }
    setEmail("");
    showToast("You're on the list — see you at launch! 🎉");
  };

  return (
    <div className="cs-wrap">
      <span className="orb orb-a" />
      <span className="orb orb-b" />
      <span className="orb orb-c" />

      <div className="relative z-10 flex items-center gap-3 mb-6">
        <div className="logo-badge w-10 h-10 rounded-xl flex items-center justify-center">
          <Dumbbell className="size-px-20 c-dark" aria-hidden="true" />
        </div>
        <div className="text-base font-black c-text">
          Dreams <span className="gt">GYM</span>
        </div>
      </div>

      <div className="relative z-10 emblem">
        <div className="ring" />
        <div className="core">
          <Dumbbell className="size-px-28 c-dark" aria-hidden="true" />
        </div>
      </div>

      <div className="relative z-10 max-w-2xl">
        <span className="badge badge-active px-3 py-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
          Launching Soon
        </span>
        <h1 className="text-3xl md:text-5xl font-black c-text mt-5 leading-tight">
          Something <span className="gt">powerful</span>
          <br className="hidden sm:block" /> is coming.
        </h1>
        <p className="text-sm md:text-[15px] mt-4 leading-relaxed max-w-xl mx-auto c-muted">
          We're putting the finishing touches on the next generation of Dreams GYM — the luxury way
          to run your gym, POS, and members. Be the first to know when we go live.
        </p>
      </div>

      <div className="relative z-10 mt-9">
        <div className="flex items-center justify-center gap-3">
          <div className="cd-box">
            <div className="cd-num">{pad(days)}</div>
            <div className="cd-lbl">Days</div>
          </div>
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

      <div className="relative z-10 w-full max-w-md mt-9">
        <form className="flex flex-col sm:flex-row gap-2.5" onSubmit={submitNotify}>
          <div className="relative flex-1">
            <Mail
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 c-dim2 pointer-events-none z-10"
              aria-hidden="true"
            />
            <input
              type="email"
              className="fp-input w-full py-3 pl-9 pr-3 text-sm"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="btn-gold px-6 py-3 text-sm flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <Bell className="w-4 h-4" aria-hidden="true" />
            Notify Me
          </button>
        </form>
        <p className="text-[11px] mt-2.5 c-dim2">
          🔒 No spam, ever. Unsubscribe anytime. Join{" "}
          <span className="c-gold font-semibold">2,500+</span> gym owners on the list.
        </p>
      </div>

      <div className="relative z-10 flex flex-wrap items-center justify-center gap-2.5 mt-9 max-w-xl">
        {FEATURES.map((f) => {
          const Icon = f.icon;
          return (
            <span key={f.label} className="feat-pill">
              <Icon className="size-px-13 c-gold" aria-hidden="true" />
              {f.label}
            </span>
          );
        })}
      </div>

      <div className="relative z-10 mt-9">
        <Link
          href={all_routes.dashboard}
          className="inline-flex items-center gap-2 text-sm font-semibold c-gold hover:underline"
        >
          <Eye className="size-px-15" aria-hidden="true" />
          Sneak a peek at the dashboard
          <ArrowRight className="size-px-15" aria-hidden="true" />
        </Link>
      </div>

      <div className="relative z-10 mt-10 flex flex-col items-center gap-3">
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
        </div>
        <p className="text-xs c-dim2">© 2026 Dreams GYM Pvt. Ltd. · Crafted for modern gyms</p>
      </div>

      <Toast message={message} visible={visible} />
    </div>
  );
};

export default ComingSoon;

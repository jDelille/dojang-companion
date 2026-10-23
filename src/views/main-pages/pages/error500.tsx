import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Activity,
  BarChart3,
  CalendarCheck,
  Dumbbell,
  LayoutDashboard,
  RefreshCw,
  ShoppingCart,
  Users,
} from "lucide-react";
import { all_routes } from "../../../routes/all_routes";

const QUICK_LINKS = [
  { label: "Members", to: all_routes.members, Icon: Users },
  { label: "POS", to: all_routes.pos, Icon: ShoppingCart },
  { label: "Attendance", to: all_routes.attendance, Icon: CalendarCheck },
  { label: "Analytics", to: all_routes.analytics, Icon: BarChart3 },
];

const Error500 = () => {
  const [ref, setRef] = useState<number | null>(null);

  useEffect(() => {
    setRef(Math.floor(1000 + Math.random() * 9000));
  }, []);

  return (
    <div className="err-wrap">
      <div className="relative z-10 flex items-center gap-3 mb-2">
        <div className="logo-badge w-10 h-10 rounded-xl flex items-center justify-center">
          <Dumbbell className="size-px-20 c-dark" aria-hidden="true" />
        </div>
        <div className="text-base font-black c-text">
          Dreams <span className="gt">GYM</span>
        </div>
      </div>

      <div className="relative z-10 err-code flex items-center justify-center gap-1 select-none">
        <span className="plate">5</span>
        <span className="zero-wrap plate">
          0
          
        </span>
        <span className="zero-wrap plate">
          0

        </span>
      </div>

      <div className="relative z-10 max-w-lg mt-2">
        <h1 className="text-2xl md:text-3xl font-black c-text">Our server pulled a muscle.</h1>
        <p className="text-sm md:text-[15px] mt-3 leading-relaxed c-muted">
          Something went wrong on our end — not yours. Our team has been notified and is already
          working to get things back in shape. Please try again in a few moments.
        </p>
      </div>

      <div className="relative z-10 glass-panel px-4 py-2.5 mt-6 flex items-center gap-2.5">
        <span className="status-dot pulse-red"></span>
        <span className="text-xs font-semibold c-text2">Internal Server Error</span>
        <span className="text-[11px] c-dim2">·</span>
        <a
          href="#"
          className="text-[11px] c-gold font-semibold hover:underline flex items-center gap-1"
        >
          <Activity className="size-px-12" aria-hidden="true" />
          System status
        </a>
      </div>

      <div className="relative z-10 flex flex-col sm:flex-row items-center gap-3 mt-7">
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="btn-gold px-6 py-3 text-sm flex items-center justify-center gap-2 w-full sm:w-auto"
        >
          <RefreshCw className="size-px-15" aria-hidden="true" />
          Try Again
        </button>
        <Link
          href={all_routes.dashboard}
          className="btn-ghost px-6 py-3 text-sm flex items-center justify-center gap-2 w-full sm:w-auto"
        >
          <LayoutDashboard className="size-px-15" aria-hidden="true" />
          Back to Dashboard
        </Link>
      </div>

      <div className="relative z-10 w-full max-w-2xl mt-9">
        <div className="text-[11px] font-black uppercase tracking-wider mb-3 c-dim2">
          Meanwhile, you can visit
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {QUICK_LINKS.map(({ label, to, Icon }) => (
            <Link key={label} href={to} className="quick-link">
              <Icon className="size-px-16 c-gold" aria-hidden="true" />
              {label}
            </Link>
          ))}
        </div>
      </div>

      <p className="relative z-10 text-xs mt-8 c-dim2">
        Problem persists?{" "}
        <a href="mailto:support@example.com" className="c-gold font-semibold hover:underline">
          Contact support
        </a>{" "}
        · Reference <span className="font-mono c-dim">ERR-500-{ref ?? "----"}</span>
      </p>
    </div>
  );
};

export default Error500;

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BarChart3,
  CalendarCheck,
  Dumbbell,
  LayoutDashboard,
  Search,
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

const Error404 = () => {
  const router = useRouter();

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
        <span className="plate">4</span>
        <span className="zero-wrap plate">
          0
          
        </span>
        <span className="plate">4</span>
      </div>

      <div className="relative z-10 max-w-lg mt-2">
        <h1 className="text-2xl md:text-3xl font-black c-text">This page skipped leg day.</h1>
        <p className="text-sm md:text-[15px] mt-3 leading-relaxed c-muted">
          The page you're looking for doesn't exist, was moved, or is taking an unscheduled rest
          day. Let's get you back to your workout.
        </p>
      </div>

      <div className="relative z-10 flex flex-col sm:flex-row items-center gap-3 mt-7">
        <Link
          href={all_routes.dashboard}
          className="btn-gold px-6 py-3 text-sm flex items-center justify-center gap-2 w-full sm:w-auto"
        >
          <LayoutDashboard className="size-px-15" aria-hidden="true" />
          Back to Dashboard
        </Link>
        <button
          type="button"
          onClick={() => router.back()}
          className="btn-ghost px-6 py-3 text-sm flex items-center justify-center gap-2 w-full sm:w-auto"
        >
          <ArrowLeft className="size-px-15" aria-hidden="true" />
          Go Back
        </button>
      </div>

      <div className="relative z-10 w-full max-w-md mt-8">
        <div className="glass-panel p-4">
          <div className="text-[11px] font-black uppercase tracking-wider mb-2.5 text-left px-1 c-dim2">
            Search the app
          </div>
          <form className="relative" onSubmit={(e) => e.preventDefault()}>
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 size-px-15 c-dim2"
              aria-hidden="true"
            />
            <input
              type="text"
              className="fp-input py-2.5 pl-9 pr-24 text-sm"
              placeholder="Members, POS, plans…"
            />
            <button
              type="submit"
              className="btn-gold absolute right-1.5 top-1/2 -translate-y-1/2 px-3.5 py-1.5 text-xs"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      <div className="relative z-10 w-full max-w-2xl mt-6">
        <div className="text-[11px] font-black uppercase tracking-wider mb-3 c-dim2">
          Popular destinations
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
        Still stuck?{" "}
        <a href="mailto:support@example.com" className="c-gold font-semibold hover:underline">
          Contact support
        </a>{" "}
        · Error code <span className="font-mono c-dim">404</span>
      </p>
    </div>
  );
};

export default Error404;

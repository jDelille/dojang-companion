import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarCheck,
  Dumbbell,
  KeyRound,
  LayoutDashboard,
  ScanLine,
  Send,
  ShieldAlert,
  Users,
} from "lucide-react";
import { all_routes } from "../../../routes/all_routes";

const QUICK_LINKS = [
  { label: "Members", to: all_routes.members, Icon: Users },
  { label: "Attendance", to: all_routes.attendance, Icon: CalendarCheck },
  { label: "Check-In", to: all_routes.checkin, Icon: ScanLine },
  { label: "Trainers", to: all_routes.trainers, Icon: Dumbbell },
];

const Error403 = () => {
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
        <span className="plate">3</span>
      </div>

      <div className="relative z-10 max-w-lg mt-2">
        <span className="badge badge-expired px-3 py-1.5">
          <ShieldAlert className="size-px-13" aria-hidden="true" />
          Access Denied
        </span>
        <h1 className="text-2xl md:text-3xl font-black c-text mt-4">
          This area is members-only.
        </h1>
        <p className="text-sm md:text-[15px] mt-3 leading-relaxed c-muted">
          You don't have permission to access this page. It may require a higher role or a
          different account. If you believe this is a mistake, contact your gym administrator.
        </p>
      </div>

      <div className="relative z-10 glass-panel px-4 py-2.5 mt-6 flex items-center gap-2.5">
        <span className="status-dot pulse-red"></span>
        <span className="text-xs font-semibold c-text2">Insufficient permissions</span>
        <span className="text-[11px] c-dim2">·</span>
        <span className="text-[11px] c-dim">
          Signed in as <span className="c-gold font-semibold">Trainer</span>
        </span>
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
          <div className="flex items-start gap-3 text-left">
            <div className="icon-box ic-gold">
              <KeyRound className="size-px-18 c-gold" aria-hidden="true" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-bold c-text">Need access to this page?</div>
              <p className="text-xs mt-0.5 mb-3 c-dim">
                Send a request to your administrator to upgrade your permissions.
              </p>
              <button type="button" className="btn-gold px-4 py-2 text-xs flex items-center gap-2">
                <Send className="size-px-13" aria-hidden="true" />
                Request Access
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 w-full max-w-2xl mt-6">
        <div className="text-[11px] font-black uppercase tracking-wider mb-3 c-dim2">
          Pages you can access
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
        Wrong account?{" "}
        <Link href={all_routes.login} className="c-gold font-semibold hover:underline">
          Sign in as someone else
        </Link>{" "}
        · Error code <span className="font-mono c-dim">403</span>
      </p>
    </div>
  );
};

export default Error403;

"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AppleIcon,
  ArrowRight,
  Mail,
  ShieldCheck,
  TrendingUp,
  Zap,
} from "lucide-react";
import AuthShell, { GoogleMark } from "./components/authShell";
import { PasswordField } from "./components/passwordField";
import { all_routes } from "../../routes/all_routes";
import Link from "next/link";

const FEATURES = [
  {
    Icon: Zap,
    title: "Lightning-fast POS",
    detail: "Check out members and sell in seconds.",
  },
  {
    Icon: ShieldCheck,
    title: "Bank-grade Security",
    detail: "Your data is encrypted and always safe.",
  },
  {
    Icon: TrendingUp,
    title: "Growth Insights",
    detail: "Actionable analytics for every branch.",
  },
];

const STATS = [
  { value: "2.5k+", label: "Gyms" },
  { value: "1.2M", label: "Members" },
  { value: "99.9%", label: "Uptime" },
];

const Brand = () => (
  <>
    <div className="relative z-10 max-w-md">
      <h1 className="text-[32px] font-black leading-tight text-white">
        Welcome back to your <span className="gt">command center.</span>
      </h1>
      <p className="text-sm mt-3 leading-relaxed c-muted">
        Sign in to manage members, run your POS, track attendance and watch your
        studio grow — all in one elegant dashboard.
      </p>

      <div className="mt-8 space-y-5">
        {FEATURES.map(({ Icon, title, detail }) => (
          <div key={title} className="brand-feat">
            <div className="fi">
              <Icon className="size-px-18 c-gold" aria-hidden="true" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">{title}</div>
              <div className="text-xs mt-0.5 c-dim">{detail}</div>
            </div>
          </div>
        ))}
      </div>
    </div>

    <div className="relative z-10 grid grid-cols-3 gap-3">
      {STATS.map((stat) => (
        <div key={stat.label} className="stat-pill">
          <div className="text-xl font-black gt leading-none">{stat.value}</div>
          <div className="text-[10px] mt-1 c-dim">{stat.label}</div>
        </div>
      ))}
    </div>
  </>
);

const DEFAULT_EMAIL = "admin@dreamsgym.com";
const DEFAULT_PASSWORD = "Password123";

const LoginComponent = () => {
  const router = useRouter();
  const [email, setEmail] = useState(DEFAULT_EMAIL);
  const [password, setPassword] = useState(DEFAULT_PASSWORD);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    router.push(all_routes.dashboard);
  };

  return (
    <AuthShell brand={<Brand />}>
      <div className="mb-6">
        <h2 className="text-2xl font-black c-text">Sign in</h2>
        <p className="text-sm mt-1.5 c-dim">
          Enter your credentials to access your dashboard.
        </p>
      </div>

      {/* Social */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <button type="button" className="social-btn">
          <GoogleMark />
          Google
        </button>
        <button type="button" className="social-btn">
          <AppleIcon className="size-px-15" aria-hidden="true" />
          Apple
        </button>
      </div>
      <div className="divider-x mb-5">or continue with email</div>

      <form className="space-y-4" noValidate onSubmit={handleSubmit}>
        {/* Email */}
        <div>
          <label
            htmlFor="login-email"
            className="block text-xs font-bold mb-1.5 c-text2"
          >
            Email address
          </label>
          <div className="relative">
            <Mail className="field-icon" aria-hidden="true" />
            <input
              id="login-email"
              name="email"
              type="email"
              className="fp-input auth-input py-2.5 text-sm"
              placeholder="you@gym.com"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
        </div>

        {/* Password */}
        <PasswordField
          id="pw"
          name="password"
          label="Password"
          placeholder="Enter your password"
          autoComplete="current-password"
          value={password}
          onValueChange={setPassword}
          action={
            <Link
              href={all_routes.forgotPassword}
              className="text-[11px] c-gold font-semibold hover:underline"
            >
              Forgot password?
            </Link>
          }
          required
        />

        {/* Remember */}
        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <input
            id="remember"
            type="checkbox"
            className="w-4 h-4 instyle-35"
            defaultChecked
          />
          <span className="text-xs c-muted">
            Keep me signed in on this device
          </span>
        </label>

        <button
          type="submit"
          className="btn-gold w-full py-3 text-sm flex items-center justify-center gap-2"
        >
          <span>Sign In</span>
          <ArrowRight className="size-px-15" aria-hidden="true" />
        </button>
      </form>

      <p className="text-center text-sm mt-6 c-dim">
        Don't have an account?
        <Link
          href={all_routes.register}
          className="c-gold font-bold hover:underline ms-1"
        >
          Create one
        </Link>
      </p>
    </AuthShell>
  );
};

export default LoginComponent;

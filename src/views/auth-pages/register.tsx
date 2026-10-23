import { useState } from "react";
import {
  AppleIcon,
  ArrowRight,
  BarChart3,
  ClipboardList,
  Crown,
  Dumbbell,
  Mail,
  Phone,
  ShoppingCart,
  Star,
  User,
  Users,
} from "lucide-react";
import AuthShell, { GoogleMark } from "./components/authShell";
import { PasswordField, StrengthMeter } from "./components/passwordField";
import { scorePassword } from "./components/passwordRules";
import { all_routes } from "../../routes/all_routes";
import Link from "next/link";

const FEATURES = [
  {
    Icon: Users,
    title: "Member & Plan Management",
    detail: "Onboard, renew and track every membership.",
  },
  {
    Icon: ShoppingCart,
    title: "Integrated POS & Billing",
    detail: "Sell products, generate invoices instantly.",
  },
  {
    Icon: BarChart3,
    title: "Real-time Analytics",
    detail: "Revenue, attendance & growth at a glance.",
  },
];

const ROLES = [
  { value: "owner", label: "Gym Owner", Icon: Crown },
  { value: "manager", label: "Manager", Icon: ClipboardList },
  { value: "trainer", label: "Trainer", Icon: Dumbbell },
];

const Brand = () => (
  <>
    <div className="relative z-10 max-w-md">
      <h1 className="text-[32px] font-black leading-tight text-white">
        Run your gym like a <span className="gt">premium brand.</span>
      </h1>
      <p className="text-sm mt-3 leading-relaxed c-muted">
        Members, POS, trainers, attendance &amp; analytics — one elegant
        dashboard built for modern fitness studios.
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

    <div className="relative z-10 quote-card">
      <div className="flex items-center gap-1 mb-2 instyle-44">
        {Array.from({ length: 5 }).map((_, index) => (
          <Star key={index} className="instyle-45" aria-hidden="true" />
        ))}
      </div>
      <p className="text-[13px] leading-relaxed instyle-46">
        "Dreams GYM transformed how we run three branches. Setup took minutes,
        and our staff love it."
      </p>
      <div className="flex items-center gap-2.5 mt-3">
        <div className="av av-gold">DF</div>
        <div>
          <div className="text-xs font-bold text-white">Daniel Foster</div>
          <div className="text-[10px] c-dim">Owner, Iron Republic</div>
        </div>
      </div>
    </div>
  </>
);

const Register = () => {
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("owner");
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (scorePassword(password) < 3) {
      setError("Choose a stronger password.");
      return;
    }
    if (!agreed) {
      setError("Please accept the Terms of Service to continue.");
      return;
    }
    setError(null);
  };

  return (
    <AuthShell brand={<Brand />}>
      <div className="mb-6">
        <h2 className="text-2xl font-black c-text">Create your account</h2>
        <p className="text-sm mt-1.5 c-dim">
          Start your 14-day free trial — no card required.
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
      <div className="divider-x mb-5">or sign up with email</div>

      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        {/* Name */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="reg-first"
              className="block text-xs font-bold mb-1.5 c-text2"
            >
              First name
            </label>
            <div className="relative">
              <User className="field-icon" aria-hidden="true" />
              <input
                id="reg-first"
                type="text"
                name="first"
                className="fp-input auth-input py-2.5 text-sm"
                placeholder="Nathan"
                autoComplete="given-name"
                required
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="reg-last"
              className="block text-xs font-bold mb-1.5 c-text2"
            >
              Last name
            </label>
            <div className="relative">
              <User className="field-icon" aria-hidden="true" />
              <input
                id="reg-last"
                type="text"
                name="last"
                className="fp-input auth-input py-2.5 text-sm"
                placeholder="Reeves"
                autoComplete="family-name"
                required
              />
            </div>
          </div>
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor="reg-email"
            className="block text-xs font-bold mb-1.5 c-text2"
          >
            Email address
          </label>
          <div className="relative">
            <Mail className="field-icon" aria-hidden="true" />
            <input
              id="reg-email"
              name="email"
              type="email"
              className="fp-input auth-input py-2.5 text-sm"
              placeholder="you@gym.com"
              autoComplete="email"
              required
            />
          </div>
        </div>

        {/* Phone */}
        <div>
          <label
            htmlFor="reg-phone"
            className="block text-xs font-bold mb-1.5 c-text2"
          >
            Phone number
          </label>
          <div className="relative">
            <Phone className="field-icon" aria-hidden="true" />
            <input
              id="reg-phone"
              name="phone"
              type="tel"
              className="fp-input auth-input py-2.5 text-sm"
              placeholder="(512) 555-0142"
              autoComplete="tel"
            />
          </div>
        </div>

        {/* Role */}
        <div>
          <label className="block text-xs font-bold mb-1.5 c-text2">
            I am a…
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            {ROLES.map(({ value, label, Icon }) => (
              <label key={value} className="role-opt">
                <input
                  type="radio"
                  name="role"
                  value={value}
                  checked={role === value}
                  onChange={() => setRole(value)}
                />
                <div className="role-box">
                  <Icon
                    className=" mx-auto mb-1.5 size-px-18 c-dim"
                    aria-hidden="true"
                  />
                  <div className="text-[11px] font-bold c-text">{label}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Password */}
        <div>
          <PasswordField
            id="pw"
            name="password"
            label="Password"
            placeholder="Create a strong password"
            autoComplete="new-password"
            value={password}
            onValueChange={(value) => {
              setPassword(value);
              if (error) setError(null);
            }}
            required
          />
          <StrengthMeter value={password} />
        </div>

        {/* Terms */}
        <label className="flex items-start gap-2.5 cursor-pointer select-none">
          <input
            id="terms"
            type="checkbox"
            className="mt-0.5 accent-gold w-4 h-4 instyle-35"
            checked={agreed}
            onChange={(event) => {
              setAgreed(event.target.checked);
              if (error) setError(null);
            }}
            required
          />
          <span className="text-xs leading-relaxed c-muted">
            I agree to the{" "}
            <Link
              href={all_routes.termsOfService}
              className="c-gold font-semibold hover:underline"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href={all_routes.privacyPolicy}
              className="c-gold font-semibold hover:underline"
            >
              Privacy Policy
            </Link>
            .
          </span>
        </label>

        {error && (
          <p className="text-[11px] c-red" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="btn-gold w-full py-3 text-sm flex items-center justify-center gap-2"
        >
          <span>Create Account</span>
          <ArrowRight className="size-px-15" aria-hidden="true" />
        </button>
      </form>

      <p className="text-center text-sm mt-6 c-dim">
        Already have an account?
        <Link
          href={all_routes.login}
          className="c-gold font-bold hover:underline ms-1"
        >
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
};

export default Register;

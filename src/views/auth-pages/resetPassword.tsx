import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CircleCheck,
  Clock,
  KeyRound,
  LockKeyhole,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import AuthShell from "./components/authShell";
import {
  PasswordField,
  PasswordRequirements,
  StrengthMeter,
} from "./components/passwordField";
import {
  PASSWORD_MIN_SCORE,
  scorePassword,
  successBadgeStyle,
} from "./components/passwordRules";
import { all_routes } from "../../routes/all_routes";
import Link from "next/link";

const FEATURES = [
  {
    Icon: LockKeyhole,
    title: "Strong by design",
    detail: "Mix letters, numbers & symbols for best security.",
  },
  {
    Icon: ShieldCheck,
    title: "Encrypted end-to-end",
    detail: "Your password is never stored in plain text.",
  },
  {
    Icon: LogOut,
    title: "Signs out other devices",
    detail: "Resetting protects you if a session was exposed.",
  },
];

const Brand = () => (
  <>
    <div className="relative z-10 max-w-md">
      <h1 className="text-[32px] font-black leading-tight text-white">
        Create a new <span className="gt">password.</span>
      </h1>
      <p className="text-sm mt-3 leading-relaxed c-muted">
        Choose a strong, unique password to keep your gym's data secure. You'll
        use this to sign in from now on.
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

    <div className="relative z-10 brand-feat">
      <div className="fi">
        <Clock className="size-px-18 c-gold" aria-hidden="true" />
      </div>
      <div>
        <div className="text-sm font-bold text-white">
          This link expires soon
        </div>
        <div className="text-xs mt-0.5 c-dim">
          Reset links are valid for 30 minutes only.
        </div>
      </div>
    </div>
  </>
);

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mismatch = confirm.length > 0 && password !== confirm;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (scorePassword(password) < PASSWORD_MIN_SCORE) {
      setError("Please satisfy all password requirements.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setError(null);
    setDone(true);
  };

  return (
    <AuthShell brand={<Brand />}>
      {done ? (
        <div className="text-center">
          <div className="key-badge mb-5 mx-auto" style={successBadgeStyle}>
            <CircleCheck className="size-px-28 c-green" aria-hidden="true" />
          </div>
          <h2 className="text-2xl font-black c-text">Password reset!</h2>
          <p className="text-sm mt-2 leading-relaxed c-muted">
            Your password has been changed successfully. You can now sign in
            with your new password.
          </p>

          <Link
            href={all_routes.login}
            className="btn-gold w-full py-3 text-sm flex items-center justify-center gap-2 mt-6"
          >
            <span>Continue to Sign In</span>
            <ArrowRight className="size-px-15" aria-hidden="true" />
          </Link>
        </div>
      ) : (
        <div>
          <div className="key-badge mb-5">
            <KeyRound className="size-px-26 c-gold" aria-hidden="true" />
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-black c-text">Set new password</h2>
            <p className="text-sm mt-1.5 c-dim">
              Choose a strong password you haven't used before.
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            <div>
              <PasswordField
                id="pw"
                name="password"
                label="New password"
                placeholder="Enter new password"
                autoComplete="new-password"
                value={password}
                onValueChange={(value) => {
                  setPassword(value);
                  if (error) setError(null);
                }}
                required
              />
             
              <StrengthMeter value={password} showSuggestion={false} />
              <PasswordRequirements value={password} />
            </div>

            <div>
              <PasswordField
                id="pw2"
                name="confirm"
                label="Confirm password"
                placeholder="Re-enter new password"
                autoComplete="new-password"
                value={confirm}
                onValueChange={(value) => {
                  setConfirm(value);
                  if (error) setError(null);
                }}
                aria-invalid={mismatch}
                required
              />
              {mismatch && (
                <p className="text-[11px] mt-1.5 c-red" role="alert">
                  Passwords don't match.
                </p>
              )}
            </div>

            {error && (
              <p className="text-[11px] c-red" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="btn-gold w-full py-3 text-sm flex items-center justify-center gap-2"
            >
              <span>Reset Password</span>
              <Check className="size-px-15" aria-hidden="true" />
            </button>
          </form>
        </div>
      )}

      <div className="mt-8 text-center">
        <Link href={all_routes.login} className="back-link">
          <ArrowLeft className="size-px-14" aria-hidden="true" />
          Back to sign in
        </Link>
      </div>
    </AuthShell>
  );
};

export default ResetPassword;

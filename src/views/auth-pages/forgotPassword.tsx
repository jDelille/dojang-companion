import { useState } from "react";
import { ArrowLeft, Info, Mail, MailCheck, Send, ShieldCheck } from "lucide-react";
import AuthShell from "./components/authShell";
import { successBadgeStyle } from "./components/passwordRules";
import { all_routes } from "../../routes/all_routes";
import Link from "next/link";

const STEPS = [
  {
    title: "Enter your email",
    detail: "Use the address linked to your account.",
  },
  {
    title: "Check your inbox",
    detail: "Open the secure reset link we send you.",
  },
  {
    title: "Set a new password",
    detail: "Choose a strong password and sign in.",
  },
];

const Brand = () => (
  <>
    <div className="relative z-10 max-w-md">
      <h1 className="text-[32px] font-black leading-tight text-white">
        Locked out? Let's get you <span className="gt">back in.</span>
      </h1>
      <p className="text-sm mt-3 leading-relaxed c-muted">
        Resetting your password is quick and secure. We'll email you a link to
        create a new one.
      </p>

      <div className="mt-8 space-y-5">
        {STEPS.map((step, index) => (
          <div key={step.title} className="step-row">
            <div className="step-num">{index + 1}</div>
            <div>
              <div className="text-sm font-bold text-white">{step.title}</div>
              <div className="text-xs mt-0.5 c-dim">{step.detail}</div>
            </div>
          </div>
        ))}
      </div>
    </div>

    <div className="relative z-10 brand-feat">
      <div className="fi">
        <ShieldCheck className="size-px-18 c-gold" aria-hidden="true" />
      </div>
      <div>
        <div className="text-sm font-bold text-white">
          Your account stays protected
        </div>
        <div className="text-xs mt-0.5 c-dim">
          Reset links expire in 30 minutes for your safety.
        </div>
      </div>
    </div>
  </>
);

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resent, setResent] = useState(false);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError("Enter a valid email address.");
      return;
    }
    setError(null);
    setSent(true);
  };

  return (
    <AuthShell brand={<Brand />}>
      {sent ? (
        <div className="text-center">
          <div className="key-badge mb-5 mx-auto" style={successBadgeStyle}>
            <MailCheck className="size-px-26 c-green" aria-hidden="true" />
          </div>
          <h2 className="text-2xl font-black c-text">Check your email</h2>
          <p className="text-sm mt-2 leading-relaxed c-muted">
            We've sent a password reset link to{" "}
            <span className="font-bold c-text">{email}</span>. It may take a
            minute to arrive.
          </p>

          <div className="glass-card p-4 mt-6 text-left flex items-start gap-3">
            <Info className="size-px-16 c-gold flex-shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-xs leading-relaxed c-muted">
              Didn't get it? Check your spam folder, or{" "}
              <button
                type="button"
                className="c-gold font-semibold hover:underline"
                onClick={() => setResent(true)}
              >
                resend the link
              </button>
              . The link expires in 30 minutes.
              {resent && (
                <span className="block mt-1 c-green" role="status">
                  Reset link sent again.
                </span>
              )}
            </p>
          </div>

          <Link
            href={all_routes.login}
            className="btn-gold w-full py-3 text-sm flex items-center justify-center gap-2 mt-6"
          >
            <ArrowLeft className="size-px-15" aria-hidden="true" />
            <span>Back to Sign In</span>
          </Link>

          <button
            type="button"
            className="back-link mt-6 mx-auto"
            onClick={() => {
              setSent(false);
              setResent(false);
            }}
          >
            <ArrowLeft className="size-px-14" aria-hidden="true" />
            Use a different email
          </button>
        </div>
      ) : (
        <div>
          <div className="key-badge mb-5">
            <Mail className="size-px-26 c-gold" aria-hidden="true" />
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-black c-text">Forgot password?</h2>
            <p className="text-sm mt-1.5 c-dim">
              No worries — enter your email and we'll send you a reset link.
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            <div>
              <label
                htmlFor="forgot-email"
                className="block text-xs font-bold mb-1.5 c-text2"
              >
                Email address
              </label>
              <div className="relative">
                <Mail className="field-icon" aria-hidden="true" />
                <input
                  id="forgot-email"
                  name="email"
                  type="email"
                  className="fp-input auth-input py-2.5 text-sm"
                  placeholder="you@gym.com"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    if (error) setError(null);
                  }}
                  aria-invalid={!!error}
                  aria-describedby={error ? "forgot-email-error" : undefined}
                  required
                />
              </div>
              {error && (
                <p
                  id="forgot-email-error"
                  className="text-[11px] mt-1.5 c-red"
                  role="alert"
                >
                  {error}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="btn-gold w-full py-3 text-sm flex items-center justify-center gap-2"
            >
              <span>Send Reset Link</span>
              <Send className="size-px-15" aria-hidden="true" />
            </button>
          </form>

          <div className="mt-8 text-center">
            <Link href={all_routes.login} className="back-link">
              <ArrowLeft className="size-px-14" aria-hidden="true" />
              Back to sign in
            </Link>
          </div>
        </div>
      )}
    </AuthShell>
  );
};

export default ForgotPassword;

import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CircleCheck,
  MailCheck,
  ShieldCheck,
} from "lucide-react";
import AuthShell from "./components/authShell";
import { successBadgeStyle } from "./components/passwordRules";
import { all_routes } from "../../routes/all_routes";
import Link from "next/link";

const OTP_LENGTH = 6;
const RESEND_SECONDS = 30;

const STEPS = [
  {
    title: "Open your inbox",
    detail: "We just sent a 6-digit verification code.",
  },
  {
    title: "Enter the code",
    detail: "Type or paste it into the boxes on the right.",
  },
  { title: "You're all set", detail: "Jump straight into your new dashboard." },
];

const Brand = () => (
  <>
    <div className="relative z-10 max-w-md">
      <h1 className="text-[32px] font-black leading-tight text-white">
        One last step to <span className="gt">get started.</span>
      </h1>
      <p className="text-sm mt-3 leading-relaxed c-muted">
        Verifying your email keeps your account secure and unlocks your full
        Dreams GYM dashboard.
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
          Verified accounts stay safer
        </div>
        <div className="text-xs mt-0.5 c-dim">
          The code expires in 10 minutes for your security.
        </div>
      </div>
    </div>
  </>
);

const VerifyEmail = () => {
  const [digits, setDigits] = useState<string[]>(() =>
    Array(OTP_LENGTH).fill(""),
  );
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);

  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Resend cooldown.
  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  const code = digits.join("");

  const setDigit = (index: number, value: string) => {
    setDigits((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
    if (error) setError(null);
  };

  const handleChange = (index: number, raw: string) => {
    const value = raw.replace(/\D/g, "");
    if (!value) {
      setDigit(index, "");
      return;
    }
    if (value.length > 1) {
      fill(value, index);
      return;
    }
    setDigit(index, value);
    if (index < OTP_LENGTH - 1) inputsRef.current[index + 1]?.focus();
  };

  const fill = (value: string, from = 0) => {
    const chars = value.replace(/\D/g, "").slice(0, OTP_LENGTH - from).split("");
    setDigits((prev) => {
      const next = [...prev];
      chars.forEach((char, offset) => {
        next[from + offset] = char;
      });
      return next;
    });
    if (error) setError(null);
    const last = Math.min(from + chars.length, OTP_LENGTH - 1);
    inputsRef.current[last]?.focus();
  };

  const handleKeyDown = (
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      event.preventDefault();
      setDigit(index - 1, "");
      inputsRef.current[index - 1]?.focus();
    }
    if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      inputsRef.current[index - 1]?.focus();
    }
    if (event.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      event.preventDefault();
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (code.length < OTP_LENGTH) {
      setError("Enter all six digits.");
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
          <h2 className="text-2xl font-black c-text">Email verified!</h2>
          <p className="text-sm mt-2 leading-relaxed c-muted">
            Your account is now active. Welcome to Dreams GYM — let's get to
            work.
          </p>

          <Link
            href={all_routes.dashboard}
            className="btn-gold w-full py-3 text-sm flex items-center justify-center gap-2 mt-6"
          >
            <span>Go to Dashboard</span>
            <ArrowRight className="size-px-15" aria-hidden="true" />
          </Link>
        </div>
      ) : (
        <div>
          <div className="key-badge mb-5">
            <MailCheck className="size-px-26 c-gold" aria-hidden="true" />
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-black c-text">Verify your email</h2>
            <p className="text-sm mt-1.5 leading-relaxed c-dim">
              Enter the 6-digit code we sent to{" "}
              <span className="font-bold c-text">nathan@fitproelite.com</span>.
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="otp-row mb-2" role="group" aria-label="Verification code">
              {digits.map((digit, index) => (
                <input
                  key={index}
                  ref={(element) => {
                    inputsRef.current[index] = element;
                  }}
                  type="text"
                  className="otp-box"
                  inputMode="numeric"
                  maxLength={1}
                  autoComplete={index === 0 ? "one-time-code" : "off"}
                  aria-label={`Digit ${index + 1}`}
                  aria-invalid={!!error}
                  value={digit}
                  onChange={(event) => handleChange(index, event.target.value)}
                  onKeyDown={(event) => handleKeyDown(index, event)}
                  // Pasting the whole code into any box fills the row.
                  onPaste={(event) => {
                    event.preventDefault();
                    fill(event.clipboardData.getData("text"), index);
                  }}
                  onFocus={(event) => event.target.select()}
                />
              ))}
            </div>

            <div className="text-[11px] mb-5 h-4 c-dim" role="status">
              {error ?? "Tip: you can paste the whole code at once."}
            </div>

            <button
              type="submit"
              className="btn-gold w-full py-3 text-sm flex items-center justify-center gap-2"
            >
              <span>Verify Email</span>
              <ArrowRight className="size-px-15" aria-hidden="true" />
            </button>
          </form>

          <p className="text-center text-sm mt-6 c-dim">
            Didn't get a code?{" "}
            <button
              type="button"
              className="c-gold font-bold hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={secondsLeft > 0}
              onClick={() => setSecondsLeft(RESEND_SECONDS)}
            >
              Resend
            </button>
            {secondsLeft > 0 && (
              <span className="text-[11px] c-dim2 ms-1">
                in {secondsLeft}s
              </span>
            )}
          </p>
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

export default VerifyEmail;

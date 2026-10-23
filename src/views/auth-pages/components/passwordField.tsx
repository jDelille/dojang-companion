import { useId, useState, type InputHTMLAttributes } from "react";
import { CircleCheck, Circle, Eye, EyeOff, Lock } from "lucide-react";
import {
  PASSWORD_RULES,
  STRENGTH_COLORS,
  passwordSuggestion,
  scorePassword,
  strengthLabel,
  strengthLabelColor,
} from "./passwordRules";

type PasswordFieldProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "value" | "onChange"
> & {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  action?: React.ReactNode;
};

export const PasswordField = ({
  label,
  value,
  onValueChange,
  action,
  id,
  ...rest
}: PasswordFieldProps) => {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label htmlFor={inputId} className="block text-xs font-bold c-text2">
          {label}
        </label>
        {action}
      </div>
      <div className="relative">
        <Lock className="field-icon" aria-hidden="true" />
        <input
          id={inputId}
          type={visible ? "text" : "password"}
          className="fp-input auth-input pr-11 py-2.5 text-sm"
          value={value}
          onChange={(event) => onValueChange(event.target.value)}
          {...rest}
        />
        <button
          type="button"
          className="pw-toggle"
          onClick={() => setVisible((prev) => !prev)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
        >
          {visible ? (
            <Eye className="size-px-16" aria-hidden="true" />
          ) : (
            <EyeOff className="size-px-16" aria-hidden="true" />
          )}
        </button>
      </div>
    </div>
  );
};

export const StrengthMeter = ({
  value,
  showSuggestion = true,
}: {
  value: string;
  showSuggestion?: boolean;
}) => {
  const score = scorePassword(value);
  const suggestion = passwordSuggestion(value);

  return (
    <>
      <div className="flex items-center gap-1.5 mt-2" aria-hidden="true">
        {PASSWORD_RULES.map((rule, index) => (
          <span
            key={rule.id}
            className="strength-seg"
            style={{
              background:
                value && index < score
                  ? STRENGTH_COLORS[score - 1]
                  : "var(--card2)",
            }}
          />
        ))}
      </div>

      <div className="flex items-center justify-between gap-3 mt-1">
        {showSuggestion && (
          <p className="text-[11px] c-dim leading-relaxed">{suggestion}</p>
        )}
        <p
          className="text-[11px] font-semibold shrink-0 ms-auto"
          style={{ color: strengthLabelColor(value) }}
          role="status"
        >
          <span className="sr-only">Password strength: </span>
          {strengthLabel(value)}
        </p>
      </div>
    </>
  );
};

export const PasswordRequirements = ({ value }: { value: string }) => (
  <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 mt-3">
    {PASSWORD_RULES.map((rule) => {
      const passed = rule.test(value);
      return (
        <div
          key={rule.id}
          className={`req-item${passed ? " ok" : ""}`}
          data-req={rule.id}
        >
          {passed ? (
            <CircleCheck className="rc" aria-hidden="true" />
          ) : (
            <Circle className="rc" aria-hidden="true" />
          )}
          {rule.label}
        </div>
      );
    })}
  </div>
);

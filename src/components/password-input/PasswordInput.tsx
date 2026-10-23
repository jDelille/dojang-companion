import { useState, type InputHTMLAttributes, type ReactNode } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { FIELD, TRIGGER_ICON } from "../common/tokens";

export type PasswordInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type"
> & {
  id: string;
  icon?: ReactNode | null;
  showLabel?: string;
  hideLabel?: string;
};

const PasswordInput = ({
  id,
  className = FIELD,
  placeholder = "••••••••••••",
  icon = <Lock className={TRIGGER_ICON} aria-hidden="true" />,
  showLabel = "Show password",
  hideLabel = "Hide password",
  ...rest
}: PasswordInputProps) => {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        id={id}
        type={visible ? "text" : "password"}
        className={`${className} ${icon ? "ps-9" : ""} pe-10`}
        placeholder={placeholder}
        {...rest}
      />

      {icon && (
        <span className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
          {icon}
        </span>
      )}

      <button
        type="button"
        onClick={() => setVisible((prev) => !prev)}
        aria-label={visible ? hideLabel : showLabel}
        aria-pressed={visible}
        className="absolute inset-y-0 end-0 flex items-center px-3 cursor-pointer text-[var(--dim2)] hover:text-[var(--text)] transition-colors"
      >
        {visible ? (
          <Eye className={TRIGGER_ICON} aria-hidden="true" />
        ) : (
          <EyeOff className={TRIGGER_ICON} aria-hidden="true" />
        )}
      </button>
    </div>
  );
};

export default PasswordInput;

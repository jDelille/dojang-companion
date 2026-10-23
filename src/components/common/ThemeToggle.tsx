import { Monitor, Moon, Sun, type LucideIcon } from "lucide-react";
import useTheme from "../../hooks/useTheme";
import type { ThemePreference } from "../../contexts/themeContextValue";

const OPTIONS: {
  value: ThemePreference;
  label: string;
  title: string;
  Icon: LucideIcon;
}[] = [
  { value: "light", label: "Light theme", title: "Light", Icon: Sun },
  { value: "dark", label: "Dark theme", title: "Dark", Icon: Moon },
  {
    value: "system",
    label: "Match system theme",
    title: "System",
    Icon: Monitor,
  },
];

export type ThemeToggleProps = {
  variant?: "dropdown" | "segmented";
  className?: string;
  id?: string;
};

const ThemeToggle = ({
  variant = "dropdown",
  className,
  id = "theme-menu",
}: ThemeToggleProps) => {
  const { theme, resolvedTheme, setTheme } = useTheme();

  if (variant === "segmented") {
    return (
      <div
        className={
          className ?? "theme-switch absolute top-5 right-5 z-20"
        }
        role="radiogroup"
        aria-label="Colour theme"
      >
        {OPTIONS.map(({ value, label, title, Icon }) => (
          <button
            key={value}
            type="button"
            className="ts-btn"
            role="radio"
            aria-checked={theme === value}
            title={title}
            aria-label={label}
            onClick={() => setTheme(value)}
          >
            <Icon className="w-[15px] h-[15px]" aria-hidden="true" />
          </button>
        ))}
      </div>
    );
  }

  const isDark = resolvedTheme === "dark";
  const TriggerIcon = isDark ? Moon : Sun;

  return (
    <button
      type="button"
      id={id}
      className={className ?? "hbtn"}
      title={isDark ? "Light" : "Dark"}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      <TriggerIcon className="w-4 h-4" aria-hidden="true" />
    </button>
  );
};

export default ThemeToggle;

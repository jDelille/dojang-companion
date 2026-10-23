export const PASSWORD_RULES = [
  { id: "len", label: "8+ characters", test: (v: string) => v.length >= 8 },
  {
    id: "case",
    label: "Upper & lowercase",
    test: (v: string) => /[A-Z]/.test(v) && /[a-z]/.test(v),
  },
  { id: "num", label: "A number", test: (v: string) => /\d/.test(v) },
  {
    id: "sym",
    label: "A symbol",
    test: (v: string) => /[^A-Za-z0-9]/.test(v),
  },
] as const;

export const STRENGTH_COLORS = ["#F87171", "#FB923C", "#F4D03F", "#4ADE80"];

export const STRENGTH_LABELS = ["—", "Weak", "Fair", "Good", "Strong"];

export const STRENGTH_LABEL_COLORS = [
  "var(--dim)",
  ...STRENGTH_COLORS,
];

export const PASSWORD_HINT =
  "Use 8+ characters with a mix of letters, numbers & symbols.";

export function passwordSuggestion(value: string): string {
  if (!value) return PASSWORD_HINT;

  const failed = PASSWORD_RULES.filter((rule) => !rule.test(value));
  if (failed.length === 0) return "Great — this is a strong password.";

  const SUGGESTIONS: Record<string, string> = {
    len: "Make it at least 8 characters.",
    case: "Add both upper and lowercase letters.",
    num: "Add a number.",
    sym: "Add a symbol, e.g. ! ? or #.",
  };

  const next = SUGGESTIONS[failed[0].id];
  return failed.length > 1 ? `${next} (${failed.length} left)` : next;
}

export const PASSWORD_MIN_SCORE = PASSWORD_RULES.length;

export const scorePassword = (value: string) =>
  value ? PASSWORD_RULES.filter((rule) => rule.test(value)).length : 0;

export const strengthLabel = (value: string): string =>
  !value
    ? STRENGTH_LABELS[0]
    : STRENGTH_LABELS[Math.max(scorePassword(value), 1)];

export const strengthLabelColor = (value: string): string =>
  !value
    ? STRENGTH_LABEL_COLORS[0]
    : STRENGTH_LABEL_COLORS[Math.max(scorePassword(value), 1)];

export const successBadgeStyle = {
  background:
    "linear-gradient(135deg,rgba(74,222,128,0.14),rgba(34,197,94,0.06))",
  borderColor: "rgba(74,222,128,0.25)",
};

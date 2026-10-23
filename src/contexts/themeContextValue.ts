"use client";

import { createContext } from "react";

export type ThemePreference = "system" | "light" | "dark";
export type ResolvedTheme = "light" | "dark";

export type AccentId = "gold" | "emerald" | "royal" | "cyan" | "ruby" | "amber" | "violet";
export type SurfaceTintId =
  | "dark"
  | "charcoal"
  | "grey"
  | "white"
  | "stone"
  | "slate"
  | "midnight"
  | "emerald"
  | "violet"
  | "amber"
  | "rose";
export type SidebarThemeId = "auto" | "dark" | "light" | "accent";
export type HeaderStyleId = "auto" | "glass" | "solid" | "transparent" | "bordered";
export type LayoutWidthId = "full" | "boxed" | "wide";
export type BorderRadiusId = "sharp" | "small" | "default" | "large";
export type FontSizeId = "small" | "default" | "large";

/** Every appearance option, mirroring tailwind/src/assets/js/appearance.js DEFAULTS. */
export type AppearanceConfig = {
  mode: ThemePreference;
  accent: AccentId;
  theme: SurfaceTintId;
  sidebar: SidebarThemeId;
  header: HeaderStyleId;
  fixedHeader: boolean;
  width: LayoutWidthId;
  radius: BorderRadiusId;
  font: FontSizeId;
  animations: boolean;
  compact: boolean;
};

export const APPEARANCE_DEFAULTS: AppearanceConfig = {
  mode: "light",
  accent: "gold",
  theme: "dark",
  sidebar: "auto",
  header: "auto",
  fixedHeader: true,
  width: "full",
  radius: "default",
  font: "default",
  animations: true,
  compact: false,
};

export const ACCENTS: AccentId[] = ["gold", "emerald", "royal", "cyan", "ruby", "amber", "violet"];
export const SURFACE_TINTS: SurfaceTintId[] = [
  "dark",
  "charcoal",
  "grey",
  "white",
  "stone",
  "slate",
  "midnight",
  "emerald",
  "violet",
  "amber",
  "rose",
];
export const SIDEBAR_THEMES: SidebarThemeId[] = ["auto", "dark", "light", "accent"];
export const HEADER_STYLES: HeaderStyleId[] = ["auto", "glass", "solid", "transparent", "bordered"];

export const LAYOUT_WIDTHS: Record<LayoutWidthId, string> = {
  full: "100%",
  wide: "1600px",
  boxed: "1280px",
};
export const BORDER_RADII: Record<BorderRadiusId, string> = {
  sharp: "0",
  small: "0.6",
  default: "1",
  large: "1.5",
};
export const FONT_SIZES: Record<FontSizeId, string> = {
  small: "0.92",
  default: "1",
  large: "1.1",
};

export interface ThemeContextValue {
  theme: ThemePreference;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: ThemePreference) => void;
  /** Full appearance config beyond just light/dark mode. */
  appearance: AppearanceConfig;
  /** Sets one appearance field, applies it live, and persists immediately. */
  setAppearanceField: <K extends keyof AppearanceConfig>(
    key: K,
    value: AppearanceConfig[K],
  ) => void;
  /** Replaces the whole config in one go (used by Settings' bulk actions). */
  setAppearanceConfig: (config: AppearanceConfig) => void;
  resetAppearance: () => void;
}

export const THEME_STORAGE_KEY = "theme";

export const DEFAULT_PREFERENCE: ThemePreference = "system";

export const APPEARANCE_STORAGE_KEY = "fitpro-appearance";
/** Back-compat alias — some code still refers to the pre-rename constant name. */
export const LEGACY_APPEARANCE_KEY = APPEARANCE_STORAGE_KEY;

export const isThemePreference = (value: unknown): value is ThemePreference =>
  value === "system" || value === "light" || value === "dark";

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export function readStoredAppearance(): AppearanceConfig {
  try {
    const raw = localStorage.getItem(APPEARANCE_STORAGE_KEY);
    if (!raw) return { ...APPEARANCE_DEFAULTS };
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return { ...APPEARANCE_DEFAULTS };
    const saved = parsed as Partial<AppearanceConfig>;
    return { ...APPEARANCE_DEFAULTS, ...saved };
  } catch {
    return { ...APPEARANCE_DEFAULTS };
  }
}

export function readStoredPreference(): ThemePreference {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (isThemePreference(saved)) return saved;
    return readStoredAppearance().mode;
  } catch {
    return DEFAULT_PREFERENCE;
  }
}

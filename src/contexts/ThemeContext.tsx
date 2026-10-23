"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { usePrefersDark } from "../hooks/useMediaQuery";
import {
  ACCENTS,
  APPEARANCE_DEFAULTS,
  APPEARANCE_STORAGE_KEY,
  HEADER_STYLES,
  SIDEBAR_THEMES,
  SURFACE_TINTS,
  THEME_STORAGE_KEY,
  ThemeContext,
  readStoredAppearance,
  readStoredPreference,
  type AppearanceConfig,
  type ResolvedTheme,
  type ThemePreference,
} from "./themeContextValue";



/** Applies one config to <html>, mirroring appearance.js's apply(). */
function applyAppearance(config: AppearanceConfig, resolvedMode: ResolvedTheme) {
  const { classList, style } = document.documentElement;

  classList.toggle("dark", resolvedMode !== "light");
  classList.toggle("mode-light", resolvedMode === "light");

  ACCENTS.forEach((a) => classList.remove("accent-" + a));
  if (config.accent && config.accent !== "gold") classList.add("accent-" + config.accent);

  SURFACE_TINTS.forEach((t) => classList.remove("theme-" + t));
  if (config.theme && config.theme !== "dark") classList.add("theme-" + config.theme);

  SIDEBAR_THEMES.forEach((s) => classList.remove("sb-" + s));
  if (config.sidebar && config.sidebar !== "auto") classList.add("sb-" + config.sidebar);

  HEADER_STYLES.forEach((h) => classList.remove("hd-" + h));
  if (config.header && config.header !== "auto") classList.add("hd-" + config.header);
  classList.toggle("hd-auto", resolvedMode === "light");

  classList.toggle("hd-static", config.fixedHeader === false);

  style.setProperty(
    "--shell",
    { full: "100%", wide: "1600px", boxed: "1280px" }[config.width] ?? "100%",
  );
  style.setProperty(
    "--rs",
    { sharp: "0", small: "0.6", default: "1", large: "1.5" }[config.radius] ?? "1",
  );
  style.setProperty(
    "--fs",
    { small: "0.92", default: "1", large: "1.1" }[config.font] ?? "1",
  );

  classList.toggle("no-anim", config.animations === false);
  classList.toggle("compact", config.compact === true);
}

const writeAppearance = (config: AppearanceConfig) => {
  try {
    localStorage.setItem(APPEARANCE_STORAGE_KEY, JSON.stringify(config));
  } catch {
    void 0;
  }
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [appearance, setAppearanceState] = useState<AppearanceConfig>(() => {
    const stored = readStoredAppearance();
    const legacyMode = readStoredPreference();
    return { ...stored, mode: legacyMode };
  });

  const prefersDark = usePrefersDark();

  const theme = appearance.mode;
  const resolvedTheme: ResolvedTheme =
    theme === "system" ? (prefersDark ? "dark" : "light") : theme;

  const persist = useCallback((config: AppearanceConfig) => {
    writeAppearance(config);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, config.mode);
    } catch {
      void 0;
    }
  }, []);

  const setTheme = useCallback(
    (next: ThemePreference) => {
      setAppearanceState((prev) => {
        const updated = { ...prev, mode: next };
        persist(updated);
        return updated;
      });
    },
    [persist],
  );

  const setAppearanceField = useCallback(
    <K extends keyof AppearanceConfig>(key: K, value: AppearanceConfig[K]) => {
      setAppearanceState((prev) => {
        if (prev[key] === value) return prev;
        const updated = { ...prev, [key]: value };
        persist(updated);
        return updated;
      });
    },
    [persist],
  );

  const setAppearanceConfig = useCallback(
    (config: AppearanceConfig) => {
      setAppearanceState(config);
      persist(config);
    },
    [persist],
  );

  const resetAppearance = useCallback(() => {
    document.documentElement.style.removeProperty("--shell");
    document.documentElement.style.removeProperty("--rs");
    document.documentElement.style.removeProperty("--fs");
    setAppearanceState({ ...APPEARANCE_DEFAULTS });
    persist({ ...APPEARANCE_DEFAULTS });
  }, [persist]);

  useEffect(() => {
    applyAppearance(appearance, resolvedTheme);
  }, [appearance, resolvedTheme]);

  /* Keep other open tabs in sync, mirroring appearance.js's storage listener. */
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== APPEARANCE_STORAGE_KEY) return;
      setAppearanceState(readStoredAppearance());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const value = useMemo(
    () => ({
      theme,
      resolvedTheme,
      setTheme,
      appearance,
      setAppearanceField,
      setAppearanceConfig,
      resetAppearance,
    }),
    [
      theme,
      resolvedTheme,
      setTheme,
      appearance,
      setAppearanceField,
      setAppearanceConfig,
      resetAppearance,
    ],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export default ThemeProvider;

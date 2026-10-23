import { useCallback, useMemo, useState } from "react";
import type {
  ApiKey,
  Backup,
  Session,
  SettingsModel,
  SettingsSection,
  SettingsTab,
} from "../../types/settings";
import { useTheme } from "../../hooks/useTheme";
import { APPEARANCE_DEFAULTS, type AppearanceConfig } from "../../contexts/themeContextValue";
import {
  API_KEYS,
  BACKUPS,
  DEFAULTS,
  NOTIF_DEFS,
  SECTIONS,
  SECTION_LABEL,
  SECTION_TAB,
  SESSIONS,
  TODAY,
  tabSection,
} from "../../utils/json/settingsData";
import useToast from "../../hooks/useToast";

/*
   Settings state — ported from tailwind/src/assets/js/settings.js. Holds the
   committed model (`saved`), the live form model (`draft`), the active nav tab,
   and the non-versioned side data (sessions, API keys, backups). Dirty tracking
   compares saved vs draft per section. Mutations reproduce the exact toast().
*/

const clone = <T,>(o: T): T => JSON.parse(JSON.stringify(o));

const addDays = (iso: string, n: number): string => {
  const p = String(iso).split("-").map(Number);
  const d = new Date(p[0], p[1] - 1, p[2]);
  d.setDate(d.getDate() + n);
  return (
    d.getFullYear() +
    "-" +
    String(d.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(d.getDate()).padStart(2, "0")
  );
};

const randomKey = (): string => {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let out = "";
  for (let i = 0; i < 24; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
};

export function useSettings() {
  const { message, visible, showToast } = useToast();
  const {
    appearance: liveAppearance,
    setAppearanceField,
    setAppearanceConfig,
    resetAppearance: resetLiveAppearance,
  } = useTheme();

  const [saved, setSaved] = useState<SettingsModel>(() => clone(DEFAULTS));
  const [draft, setDraft] = useState<SettingsModel>(() => ({
    ...clone(DEFAULTS),
    appearance: { ...clone(DEFAULTS.appearance), ...liveAppearance },
  }));
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");

  const [sessions, setSessions] = useState<Session[]>(() => clone(SESSIONS));
  const [apiKeys, setApiKeys] = useState<ApiKey[]>(() => clone(API_KEYS));
  const [backups, setBackups] = useState<Backup[]>(() => clone(BACKUPS));
  const [keySeq, setKeySeq] = useState(3);
  const [backupSeq, setBackupSeq] = useState(3);

  /* ---------- Draft editing ---------- */
  const patch = useCallback(
    <S extends SettingsSection>(section: S, values: Partial<SettingsModel[S]>) => {
      setDraft((prev) => ({ ...prev, [section]: { ...prev[section], ...values } }));
    },
    [],
  );

  /*
     Appearance applies live and persists immediately — unlike every other
     section here, it does not wait for the page Save button, matching
     appearance.js's save() (write + apply on every change). `draft` and
     `saved` both track the applied value so Appearance never shows as dirty.
  */
  const setAppearance = useCallback(
    <K extends keyof SettingsModel["appearance"]>(
      key: K,
      value: SettingsModel["appearance"][K],
    ) => {
      if (draft.appearance[key] === value) return;

      if (key in liveAppearance) {
        setAppearanceField(
          key as keyof typeof liveAppearance,
          value as (typeof liveAppearance)[keyof typeof liveAppearance],
        );
      }
      setDraft((prev) => ({ ...prev, appearance: { ...prev.appearance, [key]: value } }));
      setSaved((prev) => ({ ...prev, appearance: { ...prev.appearance, [key]: value } }));

      const shown = typeof value === "boolean" ? (value ? "on" : "off") : value;
      showToast(
        (
          {
            mode: "Theme mode",
            accent: "Accent",
            theme: "Surface tint",
            sidebar: "Sidebar",
            header: "Header",
            fixedHeader: "Fixed header",
            width: "Layout width",
            radius: "Border radius",
            font: "Font size",
            animations: "Animations",
            compact: "Compact mode",
            autoCollapse: "Sidebar auto-collapse",
          } as Record<string, string>
        )[key as string] +
          ": " +
          shown,
      );
    },
    [draft.appearance, liveAppearance, setAppearanceField, showToast],
  );

  const resetAppearance = useCallback(() => {
    resetLiveAppearance();
    setDraft((prev) => ({ ...prev, appearance: clone(DEFAULTS.appearance) }));
    setSaved((prev) => ({ ...prev, appearance: clone(DEFAULTS.appearance) }));
    showToast("Appearance reset to default");
  }, [resetLiveAppearance, showToast]);

  const notifBulk = useCallback(
    (on: boolean) => {
      const next = {} as SettingsModel["notifications"];
      NOTIF_DEFS.forEach((n) => {
        next[n.key] = on;
      });
      setDraft((prev) => ({ ...prev, notifications: next }));
      showToast(on ? "All notifications enabled" : "All notifications disabled");
    },
    [showToast],
  );

  /* ---------- Dirty tracking ---------- */
  const dirtySections = useMemo(
    () =>
      SECTIONS.filter((s) => JSON.stringify(saved[s]) !== JSON.stringify(draft[s])),
    [saved, draft],
  );

  const dirtyTabs = useMemo(() => {
    const tabs: Record<string, boolean> = {};
    dirtySections.forEach((s) => {
      tabs[SECTION_TAB[s]] = true;
    });
    return tabs;
  }, [dirtySections]);

  const dirtyWhere = useMemo(
    () => dirtySections.map((s) => SECTION_LABEL[s]).join(", "),
    [dirtySections],
  );

  /* ---------- Save / discard ---------- */
  const validateAll = useCallback((): boolean => {
    const p = draft.profile;
    const b = draft.business;
    const s = draft.smtp;
    const email = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
    const digits = (v: string) => String(v).replace(/\D/g, "").length;
    let ok = true;
    if (!p.name.trim() || p.name.trim().length < 2) ok = false;
    if (!p.email.trim() || !email(p.email.trim())) ok = false;
    if (!p.phone.trim() || digits(p.phone) < 10) ok = false;
    if ((p.bio || "").length > 240) ok = false;
    if (!b.gymName.trim()) ok = false;
    if (b.ein.trim() && !/^[0-9]{2}-[0-9]{7}$/.test(b.ein.trim())) ok = false;
    if (!b.email.trim() || !email(b.email.trim())) ok = false;
    if (!b.phone.trim() || digits(b.phone) < 8) ok = false;
    if (!b.address.trim()) ok = false;
    if (!String(s.host).trim()) ok = false;
    const port = Number(s.port);
    if (!port || port < 1 || port > 65535) ok = false;
    if (!String(s.user).trim()) ok = false;
    if (!String(s.from).trim() || !email(String(s.from).trim())) ok = false;
    return ok;
  }, [draft]);

  const saveSettings = useCallback(() => {
    if (!validateAll()) {
      showToast("Fix the highlighted fields before saving");
      return;
    }
    if (!dirtySections.length) {
      showToast("No changes to save");
      return;
    }
    setSaved(clone(draft));
    showToast(
      "Settings saved · " + dirtySections.map((s) => SECTION_LABEL[s]).join(", "),
    );
  }, [validateAll, dirtySections, draft, showToast]);

  const discardChanges = useCallback(() => {
    setDraft(clone(saved));
    showToast("Changes discarded");
  }, [saved, showToast]);

  /* ---------- Reset ---------- */
  const confirmReset = useCallback(
    (scope: "section" | "all") => {
      if (scope === "all") {
        setDraft(clone(DEFAULTS));
        setSaved(clone(DEFAULTS));
        resetLiveAppearance();
        showToast("All settings reset to defaults");
      } else {
        const sec = tabSection(activeTab);
        setDraft((prev) => ({ ...prev, [sec]: clone(DEFAULTS[sec]) }));
        setSaved((prev) => ({ ...prev, [sec]: clone(DEFAULTS[sec]) }));
        if (sec === "appearance") resetLiveAppearance();
        showToast(SECTION_LABEL[sec] + " reset to defaults");
      }
    },
    [activeTab, resetLiveAppearance, showToast],
  );

  /* ---------- Password ---------- */
  const submitPassword = useCallback(() => {
    showToast("Password updated · sign in again on other devices");
  }, [showToast]);

  /* ---------- Photo ---------- */
  const confirmPhoto = useCallback(
    (avatar: string, photo: string) => {
      patch("profile", { avatar, photo });
      showToast(photo ? "Profile photo updated" : "Avatar colour updated");
    },
    [patch, showToast],
  );

  /* ---------- Payment ---------- */
  const confirmPayment = useCallback(
    (card: SettingsModel["billing"]["card"]) => {
      setDraft((prev) => ({ ...prev, billing: { ...prev.billing, card } }));
      showToast("Payment method updated · •••• " + card.last4);
    },
    [showToast],
  );

  /* ---------- Plan ---------- */
  const confirmPlan = useCallback(
    (plan: string) => {
      if (plan === draft.billing.plan) {
        showToast("You are already on the " + plan + " plan");
        return;
      }
      setDraft((prev) => ({ ...prev, billing: { ...prev.billing, plan } }));
      showToast("Plan changed to " + plan + " · save to confirm");
    },
    [draft.billing.plan, showToast],
  );

  const downloadInvoice = useCallback(
    (id: string) => showToast("Invoice " + id + " downloaded"),
    [showToast],
  );
  const exportInvoices = useCallback(
    (count: number) => showToast(count + " invoices exported"),
    [showToast],
  );

  /* ---------- Sessions ---------- */
  const signOutOne = useCallback(
    (id: number) => {
      const s = sessions.find((x) => x.id === id);
      if (!s) return;
      setSessions((prev) => prev.filter((x) => x.id !== id));
      showToast(s.device + " signed out");
    },
    [sessions, showToast],
  );

  const confirmSignout = useCallback(() => {
    const n = sessions.filter((s) => !s.current).length;
    setSessions((prev) => prev.filter((s) => s.current));
    showToast(n + " device" + (n === 1 ? "" : "s") + " signed out");
  }, [sessions, showToast]);

  /* ---------- API keys ---------- */
  const createKey = useCallback(
    (name: string, scopes: string[], days: number): { code: string; meta: string } => {
      const secret = randomKey();
      const expires = days ? addDays(TODAY, days) : null;
      const id = keySeq + 1;
      setKeySeq(id);
      const key: ApiKey = {
        id,
        name,
        prefix: "fp_live_" + secret.slice(0, 4),
        scopes: scopes.slice(),
        created: TODAY,
        lastUsed: null,
        expires,
      };
      setApiKeys((prev) => [key, ...prev]);
      showToast("API key created");
      return {
        code: "fp_live_" + secret,
        meta:
          name +
          " · " +
          scopes.join(", ") +
          " · " +
          (expires
            ? "expires " +
              expires.split("T")[0].split("-").reverse().join(" ")
            : "never expires"),
      };
    },
    [keySeq, showToast],
  );

  const copyKey = useCallback(() => showToast("API key copied"), [showToast]);

  const confirmRevoke = useCallback(
    (id: number) => {
      const k = apiKeys.find((x) => x.id === id);
      if (!k) return;
      setApiKeys((prev) => prev.filter((x) => x.id !== id));
      showToast("“" + k.name + "” revoked");
    },
    [apiKeys, showToast],
  );

  /* ---------- SMTP ---------- */
  const smtpResult = useCallback(
    (ok: boolean, to: string) =>
      showToast(ok ? "Test email sent to " + to : "SMTP test failed"),
    [showToast],
  );

  const smtpTestOutcome = useCallback((): { ok: boolean; problems: string[] } => {
    const problems: string[] = [];
    if (!String(draft.smtp.host).trim()) problems.push("SMTP host is empty");
    const port = Number(draft.smtp.port);
    if (!port || port < 1 || port > 65535) problems.push("Port " + draft.smtp.port + " is not valid");
    if (!String(draft.smtp.from).trim()) problems.push("From address is empty");
    return { ok: problems.length === 0, problems };
  }, [draft.smtp]);

  /* ---------- Backups ---------- */
  const newBackup = useCallback(() => {
    const size = Math.round((JSON.stringify(draft).length / 1024) * 10) / 10;
    const id = backupSeq + 1;
    setBackupSeq(id);
    setBackups((prev) => [
      {
        id,
        name: "Manual backup",
        at: TODAY + "T" + "11:30",
        size: (size < 1 ? 1 : size) + " KB",
        auto: false,
      },
      ...prev,
    ]);
    showToast("Restore point created");
  }, [draft, backupSeq, showToast]);

  const downloadBackup = useCallback(() => showToast("Backup downloaded"), [showToast]);

  const confirmRestore = useCallback(
    (id: number) => {
      const b = backups.find((x) => x.id === id);
      if (!b) return;
      setDraft(clone(DEFAULTS));
      setSaved(clone(DEFAULTS));
      resetLiveAppearance();
      showToast(
        "Restored from " +
          b.name +
          " · " +
          b.at.split("T")[0].split("-").reverse().join(" "),
      );
    },
    [backups, resetLiveAppearance, showToast],
  );

  /* ---------- Import / Export ---------- */
  const confirmImport = useCallback(
    (parsed: Record<string, unknown>, mode: "merge" | "replace", knownCount: number) => {
      const base = mode === "replace" ? clone(DEFAULTS) : clone(draft);
      SECTIONS.forEach((s) => {
        if (parsed[s] && typeof parsed[s] === "object") {
          (base as Record<string, unknown>)[s] = {
            ...(base as Record<string, Record<string, unknown>>)[s],
            ...(parsed[s] as Record<string, unknown>),
          };
        }
      });
      setDraft(base);
      if (parsed.appearance && typeof parsed.appearance === "object") {
        setAppearanceConfig({
          ...APPEARANCE_DEFAULTS,
          ...(base.appearance as Partial<AppearanceConfig>),
        });
        setSaved((prev) => ({ ...prev, appearance: base.appearance }));
      }
      showToast(
        knownCount + " section" + (knownCount === 1 ? "" : "s") + " imported · review then save",
      );
    },
    [draft, setAppearanceConfig, showToast],
  );

  const exportSettings = useCallback(
    (format: string) => showToast("Settings exported as " + format.toUpperCase()),
    [showToast],
  );

  /* ---------- Delete account ---------- */
  const confirmDelete = useCallback(() => {
    showToast("Account deletion requested · our team will confirm by email");
  }, [showToast]);

  const invalidAck = useCallback(
    () => showToast("Tick the acknowledgement to continue"),
    [showToast],
  );

  return {
    saved,
    draft,
    activeTab,
    setActiveTab,
    sessions,
    apiKeys,
    backups,
    patch,
    setAppearance,
    resetAppearance,
    notifBulk,
    dirtySections,
    dirtyTabs,
    dirtyWhere,
    saveSettings,
    discardChanges,
    confirmReset,
    submitPassword,
    confirmPhoto,
    confirmPayment,
    confirmPlan,
    downloadInvoice,
    exportInvoices,
    signOutOne,
    confirmSignout,
    createKey,
    copyKey,
    confirmRevoke,
    smtpResult,
    smtpTestOutcome,
    newBackup,
    downloadBackup,
    confirmRestore,
    confirmImport,
    exportSettings,
    confirmDelete,
    invalidAck,
    toast: { message, visible },
  };
}

export default useSettings;

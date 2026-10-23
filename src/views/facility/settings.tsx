import { useState } from "react";
import {
  AlertCircle,
  AlertOctagon,
  Bell,
  Building2,
  Check,
  CreditCard,
  Crown,
  Database,
  Download,
  Key,
  KeyRound,
  Palette,
  Plus,
  RotateCcw,
  Send,
  Shield,
  Upload,
  User,
} from "lucide-react";
import type { ApiKey, Backup, SettingsTab } from "../../types/settings";
import {
  ACCENTS,
  BACKUPS,
  CURRENCIES,
  ENCRYPTIONS,
  FONT_SEG,
  HEADERS,
  MODES,
  NOTIF_DEFS,
  PLANS,
  RADIUS_SEG,
  SIDEBARS,
  THEMES,
  TIMEOUTS,
  TIMEZONES,
  WIDTH_SEG,
  fmtDate,
  inr,
  initials,
} from "../../utils/json/settingsData";
import { SETTINGS_ICON, SETTINGS_ICON_FALLBACK } from "./settingsIcons";
import Toast from "../../components/common/Toast";
import useSettings from "./useSettings";
import SettingsPhotoModal from "./modal/settingsPhotoModal";
import SettingsPaymentModal from "./modal/settingsPaymentModal";
import SettingsPlanModal from "./modal/settingsPlanModal";
import SettingsInvoicesModal from "./modal/settingsInvoicesModal";
import SettingsSessionsModal from "./modal/settingsSessionsModal";
import SettingsSignoutModal from "./modal/settingsSignoutModal";
import SettingsResetModal from "./modal/settingsResetModal";
import SettingsBackupModal from "./modal/settingsBackupModal";
import SettingsRestoreModal from "./modal/settingsRestoreModal";
import SettingsImportModal from "./modal/settingsImportModal";
import SettingsExportModal from "./modal/settingsExportModal";
import SettingsKeyNewModal from "./modal/settingsKeyNewModal";
import SettingsKeyViewModal from "./modal/settingsKeyViewModal";
import SettingsKeyRevokeModal from "./modal/settingsKeyRevokeModal";
import SettingsSmtpModal from "./modal/settingsSmtpModal";
import SettingsDeleteModal from "./modal/settingsDeleteModal";
import ImageWithBasePath from "@/components/image-with-base-path";

/*
   Settings — ported from tailwind/src/settings.html and assets/js/settings.js.
   A tabbed settings form with two-way state binding, dirty tracking and the full
   modal suite: Photo · Payment · Plan · Invoices · Sessions · Sign-out · Reset ·
   Backup & Restore · Import · Export · API Keys (create / reveal / revoke) ·
   SMTP Test · Delete Account.
*/

const NAV: { tab: SettingsTab; label: string; Icon: typeof User }[] = [
  { tab: "profile", label: "Profile", Icon: User },
  { tab: "business", label: "Business", Icon: Building2 },
  { tab: "notifications", label: "Notifications", Icon: Bell },
  { tab: "security", label: "Security", Icon: Shield },
  { tab: "billing", label: "Billing", Icon: CreditCard },
  { tab: "appearance", label: "Appearance", Icon: Palette },
  { tab: "api", label: "API & Email", Icon: KeyRound },
  { tab: "data", label: "Data", Icon: Database },
];

/* Password strength scoring — mirrors pwScore() in settings.js. */
const pwScore = (v: string): number => {
  let n = 0;
  if (v.length >= 8) n++;
  if (v.length >= 12) n++;
  if (/[0-9]/.test(v)) n++;
  if (/[^A-Za-z0-9]/.test(v)) n++;
  if (/[a-z]/.test(v) && /[A-Z]/.test(v)) n++;
  return Math.min(n, 4);
};

const PW_META = [
  { w: "0%", c: "", t: "Use 8+ characters with a number and a symbol", cls: "c-dim2" },
  { w: "25%", c: "pw-weak", t: "Weak — add length and variety", cls: "c-red" },
  { w: "50%", c: "pw-fair", t: "Fair — add a symbol or more length", cls: "c-orange" },
  { w: "75%", c: "pw-good", t: "Good", cls: "c-yellow" },
  { w: "100%", c: "pw-strong", t: "Strong", cls: "c-green" },
];

/* Appearance preview markup — spans only, mirroring mcWin/svWin/hvWin/swPage. */
const McWin = () => (
  <span className="mc-win">
    <span className="mc-hd">
      <span className="mc-dot" />
      <span className="mc-dot" />
      <span className="mc-dot" />
    </span>
    <span className="mc-body">
      <span className="mc-rail">
        <span className="mc-r-line on" />
        <span className="mc-r-line" />
        <span className="mc-r-line" />
      </span>
      <span className="mc-content">
        <span className="mc-tile" />
        <span className="mc-l w70" />
        <span className="mc-l w45" />
      </span>
    </span>
  </span>
);

const SvWin = () => (
  <>
    <span className="sv-rail">
      <span className="sv-brand" />
      <span className="sv-item on" />
      <span className="sv-item" />
      <span className="sv-item" />
      <span className="sv-item" />
    </span>
    <span className="sv-main">
      <span className="sv-hd" />
      <span className="sv-content">
        <span className="sv-tile" />
        <span className="sv-l w70" />
        <span className="sv-l w45" />
      </span>
    </span>
  </>
);

const HvWin = () => (
  <>
    <span className="hv-blob" />
    <span className="hv-blob2" />
    <span className="hv-hd">
      <span className="hv-logo" />
      <span className="hv-nav" />
      <span className="hv-nav sm" />
      <span className="hv-search" />
      <span className="hv-av" />
    </span>
    <span className="hv-body">
      <span className="hv-tile" />
      <span className="hv-l w70" />
      <span className="hv-l w45" />
    </span>
  </>
);

const SwPage = () => (
  <span className="sw-page">
    <span className="sw-rail" />
    <span className="sw-body">
      <span className="sw-bar" />
      <span className="sw-card">
        <span className="sw-line" />
        <span className="sw-line short" />
      </span>
    </span>
  </span>
);

type ModalKind =
  | "photo"
  | "payment"
  | "plan"
  | "invoices"
  | "sessions"
  | "signout"
  | "reset"
  | "backup"
  | "restore"
  | "import"
  | "export"
  | "key-new"
  | "key-view"
  | "key-revoke"
  | "smtp"
  | "delete";

const Settings = () => {
  const page = useSettings();
  const { draft, activeTab, dirtySections, dirtyTabs, dirtyWhere } = page;

  const [modal, setModal] = useState<ModalKind | null>(null);
  const [restoreTarget, setRestoreTarget] = useState<Backup | null>(null);
  const [revokeTarget, setRevokeTarget] = useState<ApiKey | null>(null);
  const [newKey, setNewKey] = useState<{ code: string; meta: string }>({ code: "—", meta: "—" });

  /* Password fields are local to the Security panel form. */
  const [pwCurrent, setPwCurrent] = useState("");
  const [pwNew, setPwNew] = useState("");
  const [pwConfirm, setPwConfirm] = useState("");

  const open = (kind: ModalKind) => setModal(kind);
  const close = () => setModal(null);

  const pwMeta = PW_META[pwNew ? pwScore(pwNew) : 0];

  const plan = PLANS.find((p) => p.id === draft.billing.plan) ?? PLANS[2];

  const createKey = (name: string, scopes: string[], days: number) => {
    const result = page.createKey(name, scopes, days);
    setNewKey(result);
    setModal("key-view");
  };

  return (
    <>
      {/* Page header */}
      <div className="flex md:items-center justify-between flex-wrap xl:flex-nowrap gap-4 mb-5">
        <div>
          <h2 className="text-xl font-black c-text">Settings</h2>
          <p className="text-sm mt-0.5 c-dim">Manage your account, business &amp; preferences</p>
        </div>
        <div className="flex items-center flex-wrap gap-2">
          <button
            type="button"
            className="btn-ghost flex items-center gap-2 px-3.5 py-2 text-sm"
            onClick={() => open("export")}
          >
            <Download className="w-[14px] h-[14px] shrink-0" aria-hidden="true" />
            Export
          </button>
          <button
            type="button"
            className="btn-ghost flex items-center gap-2 px-3.5 py-2 text-sm"
            onClick={() => open("reset")}
          >
            <RotateCcw className="w-[14px] h-[14px] shrink-0" aria-hidden="true" />
            Reset
          </button>
          <button
            type="button"
            className="btn-gold flex items-center gap-2 px-4 py-2.5 text-sm"
            onClick={page.saveSettings}
          >
            <Check className="w-[14px] h-[14px] shrink-0" aria-hidden="true" />
            Save Changes
          </button>
        </div>
      </div>

      {/* Unsaved changes bar */}
      <div className={`dirty-bar${dirtySections.length ? "" : " hidden"}`} role="status">
        <AlertCircle className="w-[14px] h-[14px] shrink-0" aria-hidden="true" />
        <span>
          You have unsaved changes in <span>{dirtyWhere || "this section"}</span>.
        </span>
        <button
          type="button"
          className="btn-ghost px-2.5 py-1 text-xs ml-auto"
          onClick={page.discardChanges}
        >
          Discard
        </button>
        <button type="button" className="btn-gold px-2.5 py-1 text-xs" onClick={page.saveSettings}>
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Nav */}
        <div className="lg:col-span-1">
          <div className="glass-card p-3 set-nav" role="tablist" aria-label="Settings sections">
            {NAV.map(({ tab, label, Icon }) => (
              <button
                key={tab}
                type="button"
                className={`set-link${activeTab === tab ? " active" : ""}${
                  dirtyTabs[tab] ? " has-changes" : ""
                }`}
                role="tab"
                aria-selected={activeTab === tab}
                onClick={() => page.setActiveTab(tab)}
              >
                <Icon className="w-[16px] h-[16px] shrink-0" aria-hidden="true" />
                {label}
                <span className="dirty-dot" />
              </button>
            ))}
          </div>
        </div>

        {/* Panels */}
        <div className="lg:col-span-3">
          {/* PROFILE */}
          <div className={`set-panel${activeTab === "profile" ? " active" : ""}`}>
            <div className="glass-card p-5">
              <h3 className="font-bold c-text sec-title mb-4">Profile Information</h3>
              <div className="flex items-center gap-4 mb-6 pb-5 bd-b">
                <div className="ring-gold relative">
                  <div className={`set-avatar${draft.profile.photo ? "" : " " + draft.profile.avatar}`}>
                    {draft.profile.photo ? (
                      <ImageWithBasePath src={draft.profile.photo} alt="Profile photo" />
                    ) : (
                      initials(draft.profile.name)
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-bold c-text">{draft.profile.name || "—"}</div>
                  <div className="text-[11px] c-dim mb-2">
                    {(draft.profile.role || "—") + " · " + (draft.profile.email || "—")}
                  </div>
                  <button
                    type="button"
                    className="btn-ghost px-3 py-1.5 text-xs flex items-center gap-1.5"
                    onClick={() => open("photo")}
                  >
                    <Upload className="w-[12px] h-[12px] shrink-0" aria-hidden="true" />
                    Change Photo
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="set-label" htmlFor="s-pf-name">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="s-pf-name"
                    className="fp-input py-2.5 text-sm"
                    value={draft.profile.name}
                    onChange={(e) => page.patch("profile", { name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="set-label" htmlFor="s-pf-email">
                    Email
                  </label>
                  <input
                    id="s-pf-email"
                    type="email"
                    className="fp-input py-2.5 text-sm"
                    value={draft.profile.email}
                    onChange={(e) => page.patch("profile", { email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="set-label" htmlFor="s-pf-phone">
                    Phone
                  </label>
                  <input
                    type="text"
                    id="s-pf-phone"
                    className="fp-input py-2.5 text-sm"
                    value={draft.profile.phone}
                    onChange={(e) => page.patch("profile", { phone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="set-label" htmlFor="s-pf-role">
                    Role
                  </label>
                  <input
                    type="text"
                    id="s-pf-role"
                    className="fp-input py-2.5 text-sm"
                    value={draft.profile.role}
                    disabled
                    readOnly
                  />
                  <div className="f-hint">Roles are managed by your organisation owner</div>
                </div>
                <div className="sm:col-span-2">
                  <label className="set-label" htmlFor="s-pf-bio">
                    Bio
                  </label>
                  <textarea
                    id="s-pf-bio"
                    className="fp-input py-2.5 text-sm"
                    rows={3}
                    maxLength={300}
                    value={draft.profile.bio}
                    onChange={(e) => page.patch("profile", { bio: e.target.value })}
                  />
                  <div className="f-hint">
                    <span>{draft.profile.bio.length}</span>/240 characters
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* BUSINESS */}
          <div className={`set-panel${activeTab === "business" ? " active" : ""}`}>
            <div className="glass-card p-5">
              <h3 className="font-bold c-text sec-title mb-4">Business Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="set-label" htmlFor="s-bz-name">
                    Gym Name
                  </label>
                  <input
                    type="text"
                    id="s-bz-name"
                    className="fp-input py-2.5 text-sm"
                    value={draft.business.gymName}
                    onChange={(e) => page.patch("business", { gymName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="set-label" htmlFor="s-bz-ein">
                    Tax ID (EIN)
                  </label>
                  <input
                    type="text"
                    id="s-bz-ein"
                    className="fp-input py-2.5 text-sm"
                    value={draft.business.ein}
                    onChange={(e) => page.patch("business", { ein: e.target.value })}
                  />
                </div>
                <div>
                  <label className="set-label" htmlFor="s-bz-email">
                    Contact Email
                  </label>
                  <input
                    id="s-bz-email"
                    type="email"
                    className="fp-input py-2.5 text-sm"
                    value={draft.business.email}
                    onChange={(e) => page.patch("business", { email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="set-label" htmlFor="s-bz-phone">
                    Support Phone
                  </label>
                  <input
                    type="text"
                    id="s-bz-phone"
                    className="fp-input py-2.5 text-sm"
                    value={draft.business.phone}
                    onChange={(e) => page.patch("business", { phone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="set-label" htmlFor="s-bz-currency">
                    Currency
                  </label>
                  <select
                    id="s-bz-currency"
                    className="fp-input py-2.5 text-sm"
                    value={draft.business.currency}
                    onChange={(e) => page.patch("business", { currency: e.target.value })}
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="set-label" htmlFor="s-bz-tz">
                    Timezone
                  </label>
                  <select
                    id="s-bz-tz"
                    className="fp-input py-2.5 text-sm"
                    value={draft.business.timezone}
                    onChange={(e) => page.patch("business", { timezone: e.target.value })}
                  >
                    {TIMEZONES.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="set-label" htmlFor="s-bz-address">
                    Registered Address
                  </label>
                  <input
                    type="text"
                    id="s-bz-address"
                    className="fp-input py-2.5 text-sm"
                    value={draft.business.address}
                    onChange={(e) => page.patch("business", { address: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* NOTIFICATIONS */}
          <div className={`set-panel${activeTab === "notifications" ? " active" : ""}`}>
            <div className="glass-card p-5 pb-1.5">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold c-text sec-title">Notification Preferences</h3>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="btn-ghost px-3 py-1.5 text-xs"
                    onClick={() => page.notifBulk(true)}
                  >
                    Enable all
                  </button>
                  <button
                    type="button"
                    className="btn-ghost px-3 py-1.5 text-xs"
                    onClick={() => page.notifBulk(false)}
                  >
                    Disable all
                  </button>
                </div>
              </div>
              <div>
                {NOTIF_DEFS.map((n) => (
                  <div key={n.key} className="set-row">
                    <div>
                      <div className="st-t">{n.label}</div>
                      <div className="st-s">{n.desc}</div>
                    </div>
                    <label className="toggle">
                      <input
                        type="checkbox"
                        checked={draft.notifications[n.key]}
                        onChange={(e) =>
                          page.patch("notifications", { [n.key]: e.target.checked })
                        }
                        aria-label={n.label}
                      />
                      <span className="toggle-slider" />
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* SECURITY */}
          <div className={`set-panel${activeTab === "security" ? " active" : ""}`}>
            <div className="glass-card p-5 mb-5">
              <h3 className="font-bold c-text sec-title mb-4">Change Password</h3>
              <form
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                noValidate
                onSubmit={(e) => {
                  e.preventDefault();
                  page.submitPassword();
                  setPwCurrent("");
                  setPwNew("");
                  setPwConfirm("");
                }}
              >
                <div className="sm:col-span-2">
                  <label className="set-label" htmlFor="s-pw-current">
                    Current Password
                  </label>
                  <input
                    id="s-pw-current"
                    type="password"
                    className="fp-input py-2.5 text-sm"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    value={pwCurrent}
                    onChange={(e) => setPwCurrent(e.target.value)}
                  />
                </div>
                <div>
                  <label className="set-label" htmlFor="s-pw-new">
                    New Password
                  </label>
                  <input
                    id="s-pw-new"
                    type="password"
                    className="fp-input py-2.5 text-sm"
                    placeholder="••••••••"
                    autoComplete="new-password"
                    value={pwNew}
                    onChange={(e) => setPwNew(e.target.value)}
                  />
                  <div className="pw-track">
                    <div className={`pw-fill ${pwMeta.c}`} style={{ width: pwMeta.w }} />
                  </div>
                  <div className={`pw-note ${pwMeta.cls}`}>{pwMeta.t}</div>
                </div>
                <div>
                  <label className="set-label" htmlFor="s-pw-confirm">
                    Confirm Password
                  </label>
                  <input
                    id="s-pw-confirm"
                    type="password"
                    className="fp-input py-2.5 text-sm"
                    placeholder="••••••••"
                    autoComplete="new-password"
                    value={pwConfirm}
                    onChange={(e) => setPwConfirm(e.target.value)}
                  />
                </div>
                <div className="sm:col-span-2 flex justify-end">
                  <button
                    type="submit"
                    className="btn-gold px-4 py-2 text-xs flex items-center gap-2"
                  >
                    <Key className="w-[12px] h-[12px] shrink-0" aria-hidden="true" />
                    Update Password
                  </button>
                </div>
              </form>
            </div>
            <div className="glass-card p-5 pb-1.5">
              <h3 className="font-bold c-text sec-title mb-2">Security Options</h3>
              <div className="set-row">
                <div>
                  <div className="st-t">Two-Factor Authentication</div>
                  <div className="st-s">Add an extra layer of security to your account</div>
                </div>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={draft.security.twoFactor}
                    onChange={(e) => page.patch("security", { twoFactor: e.target.checked })}
                    aria-label="Two-factor authentication"
                  />
                  <span className="toggle-slider" />
                </label>
              </div>
              <div className="set-row">
                <div>
                  <div className="st-t">Login Alerts</div>
                  <div className="st-s">Get notified of new sign-ins</div>
                </div>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={draft.security.loginAlerts}
                    onChange={(e) => page.patch("security", { loginAlerts: e.target.checked })}
                    aria-label="Login alerts"
                  />
                  <span className="toggle-slider" />
                </label>
              </div>
              <div className="set-row">
                <div>
                  <div className="st-t">Session Timeout</div>
                  <div className="st-s">Automatically sign out after inactivity</div>
                </div>
                <select
                  id="s-sec-timeout"
                  className="fp-input py-2 text-sm w-auto"
                  value={draft.security.timeout}
                  onChange={(e) => page.patch("security", { timeout: e.target.value })}
                  aria-label="Session timeout"
                >
                  {TIMEOUTS.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="set-row">
                <div>
                  <div className="st-t">Active Sessions</div>
                  <div className="st-s">
                    <span>{page.sessions.length}</span> devices currently signed in
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="btn-ghost px-3 py-1.5 text-xs"
                    onClick={() => open("sessions")}
                  >
                    Manage
                  </button>
                  <button
                    type="button"
                    className="btn-ghost px-3 py-1.5 text-xs"
                    onClick={() => {
                      if (page.sessions.some((s) => !s.current)) open("signout");
                      else page.confirmSignout();
                    }}
                  >
                    Sign out all
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* BILLING */}
          <div className={`set-panel${activeTab === "billing" ? " active" : ""}`}>
            <div className="gold-border-card p-5 mb-5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="badge badge-active px-2.5 py-1 mb-2 inline-flex">
                    Current Plan
                  </span>
                  <div className="text-lg font-black c-text">
                    <span>{plan.id}</span> · <span>{inr(plan.price)}</span>
                    <span className="text-xs c-dim font-medium">/month</span>
                  </div>
                  <div className="text-[11px] c-dim mt-1">{plan.hint}</div>
                </div>
                <div className="icon-box ic-gold icon-box-lg">
                  <Crown className="w-[22px] h-[22px] c-gold shrink-0" aria-hidden="true" />
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                <button
                  type="button"
                  className="btn-gold px-4 py-2 text-xs"
                  onClick={() => open("plan")}
                >
                  Upgrade Plan
                </button>
                <button
                  type="button"
                  className="btn-ghost px-4 py-2 text-xs"
                  onClick={() => open("invoices")}
                >
                  View Invoices
                </button>
              </div>
            </div>
            <div className="glass-card p-5">
              <h3 className="font-bold c-text sec-title mb-4">Payment Method</h3>
              <div className="data-row">
                <div className="icon-box ic-purple">
                  <CreditCard className="w-[18px] h-[18px] c-purple shrink-0" aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="dr-t">{"•••• •••• •••• " + draft.billing.card.last4}</div>
                  <div className="dr-s">
                    {"Expires " + draft.billing.card.exp + " · " + draft.billing.card.bank}
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-ghost px-3 py-1.5 text-xs"
                  onClick={() => open("payment")}
                >
                  Update
                </button>
              </div>
            </div>
          </div>

          {/* APPEARANCE */}
          <div className={`set-panel${activeTab === "appearance" ? " active" : ""}`}>
            <div className="glass-card p-5 mb-5">
              <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
                <div>
                  <h3 className="font-bold c-text sec-title">Theme Mode</h3>
                  <div className="f-hint mt-1">Applies instantly across the whole dashboard.</div>
                </div>
                <button
                  type="button"
                  className="btn-ghost px-3.5 py-2 text-xs flex items-center gap-2"
                  onClick={page.resetAppearance}
                >
                  <RotateCcw className="w-[12px] h-[12px] shrink-0" aria-hidden="true" />
                  Reset to Default
                </button>
              </div>
              <div className="grid grid-cols-3 gap-3" role="radiogroup" aria-label="Theme mode">
                {MODES.map((m) => {
                  const Icon = SETTINGS_ICON[m.icon] ?? SETTINGS_ICON_FALLBACK;
                  const sel = draft.appearance.mode === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      className={`pick-card${sel ? " sel" : ""}`}
                      role="radio"
                      aria-checked={sel}
                      aria-label={m.label}
                      onClick={() => page.setAppearance("mode", m.id)}
                    >
                      {m.id === "system" ? (
                        <span className="pk-prev mc-system">
                          <span className="mc-layer mc-dark">
                            <McWin />
                          </span>
                          <span className="mc-layer mc-light">
                            <McWin />
                          </span>
                          <span className="mc-split" />
                        </span>
                      ) : (
                        <span className={`pk-prev mc-${m.id}`}>
                          <McWin />
                        </span>
                      )}
                      <span className="pk-foot">
                        <span className="pk-ic">
                          <Icon className="w-[14px] h-[14px] shrink-0" aria-hidden="true" />
                        </span>
                        <span className="pk-text">
                          <span className="pk-t">{m.label}</span>
                          <span className="pk-s">{m.sub}</span>
                        </span>
                        <span className="pk-radio" />
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="glass-card p-5 mb-5">
              <h3 className="font-bold c-text sec-title mb-4">Accent Color</h3>
              <div
                className="flex items-center flex-wrap gap-3"
                role="radiogroup"
                aria-label="Accent colour"
              >
                {ACCENTS.map((a) => {
                  const sel = draft.appearance.accent === a.id;
                  return (
                    <button
                      key={a.id}
                      type="button"
                      className={`accent-dot ${a.cls}${sel ? " sel" : ""}`}
                      role="radio"
                      aria-checked={sel}
                      aria-label={`${a.id} accent`}
                      onClick={() => page.setAppearance("accent", a.id)}
                    />
                  );
                })}
              </div>
              <div className="f-hint mt-3">
                Recolours buttons, highlights, charts and badges everywhere.
              </div>
            </div>
            <div className="glass-card p-5 mb-5">
              <h3 className="font-bold c-text sec-title mb-4">Surface Tint</h3>
              <div
                className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3"
                role="radiogroup"
                aria-label="Surface tint"
              >
                {THEMES.map((t) => {
                  const sel = draft.appearance.theme === t.id;
                  return (
                    <div key={t.id}>
                      <button
                        type="button"
                        className={`swatch ${t.sw}${sel ? " sel" : ""}`}
                        role="radio"
                        aria-checked={sel}
                        aria-label={`${t.label} surface tint`}
                        onClick={() => page.setAppearance("theme", t.id)}
                      >
                        <SwPage />
                        <span className="check">
                          <Check className="w-[11px] h-[11px] shrink-0" aria-hidden="true" />
                        </span>
                      </button>
                      <div className="text-[11px] text-center mt-1.5 c-text2 font-semibold">
                        {t.label}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="f-hint mt-3">
                Tints backgrounds, cards and borders. Each tint has a light and a dark version and
                follows your Theme Mode.
              </div>
            </div>
            <div className="glass-card p-5 mb-5">
              <h3 className="font-bold c-text sec-title mb-4">Sidebar Theme</h3>
              <div
                className="grid grid-cols-2 sm:grid-cols-4 gap-3"
                role="radiogroup"
                aria-label="Sidebar theme"
              >
                {SIDEBARS.map((o) => {
                  const Icon = SETTINGS_ICON[o.icon] ?? SETTINGS_ICON_FALLBACK;
                  const sel = draft.appearance.sidebar === o.id;
                  return (
                    <button
                      key={o.id}
                      type="button"
                      className={`pick-card${sel ? " sel" : ""}`}
                      role="radio"
                      aria-checked={sel}
                      aria-label={o.label}
                      onClick={() => page.setAppearance("sidebar", o.id)}
                    >
                      <span className={`pk-prev sv-${o.id}`}>
                        <span className="sv-win">
                          <SvWin />
                        </span>
                      </span>
                      <span className="pk-foot">
                        <span className="pk-ic">
                          <Icon className="w-[14px] h-[14px] shrink-0" aria-hidden="true" />
                        </span>
                        <span className="pk-text">
                          <span className="pk-t">{o.label}</span>
                          <span className="pk-s">{o.sub}</span>
                        </span>
                        <span className="pk-radio" />
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="glass-card p-5 mb-5">
              <h3 className="font-bold c-text sec-title mb-4">Header Style</h3>
              <div
                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3"
                role="radiogroup"
                aria-label="Header style"
              >
                {HEADERS.map((o) => {
                  const Icon = SETTINGS_ICON[o.icon] ?? SETTINGS_ICON_FALLBACK;
                  const sel = draft.appearance.header === o.id;
                  return (
                    <button
                      key={o.id}
                      type="button"
                      className={`pick-card${sel ? " sel" : ""}`}
                      role="radio"
                      aria-checked={sel}
                      aria-label={o.label}
                      onClick={() => page.setAppearance("header", o.id)}
                    >
                      {o.id === "auto" ? (
                        <span className="pk-prev hv-prev hv-auto">
                          <span className="hv-layer hv-glass">
                            <span className="hv-win">
                              <HvWin />
                            </span>
                          </span>
                          <span className="hv-layer hv-lite">
                            <span className="hv-win">
                              <HvWin />
                            </span>
                          </span>
                          <span className="hv-split" />
                        </span>
                      ) : (
                        <span className={`pk-prev hv-prev hv-${o.id}`}>
                          <span className="hv-win">
                            <HvWin />
                          </span>
                        </span>
                      )}
                      <span className="pk-foot">
                        <span className="pk-ic">
                          <Icon className="w-[14px] h-[14px] shrink-0" aria-hidden="true" />
                        </span>
                        <span className="pk-text">
                          <span className="pk-t">{o.label}</span>
                          <span className="pk-s">{o.sub}</span>
                        </span>
                        <span className="pk-radio" />
                      </span>
                    </button>
                  );
                })}
              </div>
              <div className="set-row mt-4 pb-0">
                <div>
                  <div className="st-t">Fixed Header</div>
                  <div className="st-s">Keep the header pinned while the page scrolls</div>
                </div>
                <label className="toggle">
                  <input
                    id="ap-fixed-header"
                    type="checkbox"
                    checked={draft.appearance.fixedHeader}
                    onChange={(e) => page.setAppearance("fixedHeader", e.target.checked)}
                    aria-label="Fixed header"
                  />
                  <span className="toggle-slider" />
                </label>
              </div>
            </div>
            <div className="glass-card p-5 mb-5">
              <h3 className="font-bold c-text sec-title mb-4">Layout</h3>
              <div className="mb-4">
                <div className="set-label">Layout Width</div>
                <div className="seg" role="radiogroup" aria-label="Layout width">
                  {WIDTH_SEG.map((i) => (
                    <button
                      key={i.id}
                      type="button"
                      className={`seg-btn${draft.appearance.width === i.id ? " sel" : ""}`}
                      role="radio"
                      aria-checked={draft.appearance.width === i.id}
                      onClick={() => page.setAppearance("width", i.id)}
                    >
                      {i.label}
                    </button>
                  ))}
                </div>
                <div className="f-hint mt-2">
                  Boxed and Wide centre the page content on large screens.
                </div>
              </div>
              <div className="mb-4">
                <div className="set-label">Border Radius</div>
                <div className="seg" role="radiogroup" aria-label="Border radius">
                  {RADIUS_SEG.map((i) => (
                    <button
                      key={i.id}
                      type="button"
                      className={`seg-btn${draft.appearance.radius === i.id ? " sel" : ""}`}
                      role="radio"
                      aria-checked={draft.appearance.radius === i.id}
                      onClick={() => page.setAppearance("radius", i.id)}
                    >
                      {i.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="set-label">Font Size</div>
                <div className="seg" role="radiogroup" aria-label="Font size">
                  {FONT_SEG.map((i) => (
                    <button
                      key={i.id}
                      type="button"
                      className={`seg-btn${draft.appearance.font === i.id ? " sel" : ""}`}
                      role="radio"
                      aria-checked={draft.appearance.font === i.id}
                      onClick={() => page.setAppearance("font", i.id)}
                    >
                      {i.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="glass-card p-5 pb-1.5">
              <h3 className="font-bold c-text sec-title mb-4">Behaviour</h3>
              <div className="set-row">
                <div>
                  <div className="st-t">Animations</div>
                  <div className="st-s">Transitions and motion across the UI</div>
                </div>
                <label className="toggle">
                  <input
                    id="ap-anim"
                    type="checkbox"
                    checked={draft.appearance.animations}
                    onChange={(e) => page.setAppearance("animations", e.target.checked)}
                    aria-label="Animations"
                  />
                  <span className="toggle-slider" />
                </label>
              </div>
              <div className="set-row">
                <div>
                  <div className="st-t">Compact Mode</div>
                  <div className="st-s">Reduce spacing across the dashboard</div>
                </div>
                <label className="toggle">
                  <input
                    id="ap-compact"
                    type="checkbox"
                    checked={draft.appearance.compact}
                    onChange={(e) => page.setAppearance("compact", e.target.checked)}
                    aria-label="Compact mode"
                  />
                  <span className="toggle-slider" />
                </label>
              </div>
              <div className="set-row">
                <div>
                  <div className="st-t">Sidebar Auto-collapse</div>
                  <div className="st-s">Collapse the menu on smaller screens</div>
                </div>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={draft.appearance.autoCollapse}
                    onChange={(e) => page.setAppearance("autoCollapse", e.target.checked)}
                    aria-label="Sidebar auto-collapse"
                  />
                  <span className="toggle-slider" />
                </label>
              </div>
            </div>
          </div>

          {/* API & EMAIL */}
          <div className={`set-panel${activeTab === "api" ? " active" : ""}`}>
            <div className="glass-card p-5 mb-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold c-text sec-title">API Keys</h3>
                <button
                  type="button"
                  className="btn-gold px-3.5 py-2 text-xs flex items-center gap-2"
                  onClick={() => open("key-new")}
                >
                  <Plus className="w-[12px] h-[12px] shrink-0" aria-hidden="true" />
                  Create Key
                </button>
              </div>
              <div className={`key-scroll${page.apiKeys.length === 0 ? " hidden" : ""}`}>
                {page.apiKeys.map((k) => (
                  <div key={k.id} className="data-row">
                    <div className="icon-box ic-gold">
                      <KeyRound className="w-[16px] h-[16px] c-gold shrink-0" aria-hidden="true" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="dr-t truncate">{k.name}</div>
                      <div className="dr-s">
                        {k.prefix +
                          "••••••••  ·  " +
                          k.scopes.join(", ") +
                          "  ·  last used " +
                          (k.lastUsed ? fmtDate(k.lastUsed) : "never") +
                          (k.expires ? "  ·  expires " + fmtDate(k.expires) : "  ·  no expiry")}
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn-ghost px-3 py-1.5 text-xs danger-link"
                      aria-label={`Revoke ${k.name}`}
                      onClick={() => {
                        setRevokeTarget(k);
                        setModal("key-revoke");
                      }}
                    >
                      Revoke
                    </button>
                  </div>
                ))}
              </div>
              <div className={`text-center py-8${page.apiKeys.length !== 0 ? " hidden" : ""}`}>
                <div className="text-[28px] opacity-30 mb-2">🔑</div>
                <div className="text-xs font-bold c-text">No API keys yet</div>
                <div className="text-[11px] mt-1 c-dim">
                  Create one to connect Dreams GYM to your tools
                </div>
              </div>
            </div>
            <div className="glass-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold c-text sec-title">Email (SMTP)</h3>
                <span className="badge badge-inactive">
                  <span className="dot" />
                  Untested
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="set-label" htmlFor="s-smtp-host">
                    SMTP Host
                  </label>
                  <input
                    type="text"
                    id="s-smtp-host"
                    className="fp-input py-2.5 text-sm"
                    placeholder="smtp.provider.com"
                    value={draft.smtp.host}
                    onChange={(e) => page.patch("smtp", { host: e.target.value })}
                  />
                </div>
                <div>
                  <label className="set-label" htmlFor="s-smtp-port">
                    Port
                  </label>
                  <input
                    id="s-smtp-port"
                    type="number"
                    className="fp-input py-2.5 text-sm"
                    placeholder="587"
                    value={draft.smtp.port}
                    onChange={(e) =>
                      page.patch("smtp", {
                        port: e.target.value === "" ? "" : Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div>
                  <label className="set-label" htmlFor="s-smtp-user">
                    Username
                  </label>
                  <input
                    type="text"
                    id="s-smtp-user"
                    className="fp-input py-2.5 text-sm"
                    value={draft.smtp.user}
                    onChange={(e) => page.patch("smtp", { user: e.target.value })}
                  />
                </div>
                <div>
                  <label className="set-label" htmlFor="s-smtp-enc">
                    Encryption
                  </label>
                  <select
                    id="s-smtp-enc"
                    className="fp-input py-2.5 text-sm"
                    value={draft.smtp.encryption}
                    onChange={(e) => page.patch("smtp", { encryption: e.target.value })}
                  >
                    {ENCRYPTIONS.map((enc) => (
                      <option key={enc}>{enc}</option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="set-label" htmlFor="s-smtp-from">
                    From Address
                  </label>
                  <input
                    id="s-smtp-from"
                    type="email"
                    className="fp-input py-2.5 text-sm"
                    value={draft.smtp.from}
                    onChange={(e) => page.patch("smtp", { from: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <button
                  type="button"
                  className="btn-ghost px-4 py-2 text-xs flex items-center gap-2"
                  onClick={() => open("smtp")}
                >
                  <Send className="w-[12px] h-[12px] shrink-0" aria-hidden="true" />
                  Send Test Email
                </button>
              </div>
            </div>
          </div>

          {/* DATA */}
          <div className={`set-panel${activeTab === "data" ? " active" : ""}`}>
            <div className="glass-card p-5 pb-1.5 mb-5">
              <h3 className="font-bold c-text sec-title mb-4">Backup &amp; Restore</h3>
              <div className="set-row">
                <div>
                  <div className="st-t">Automatic Backups</div>
                  <div className="st-s">Create a restore point every night</div>
                </div>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={draft.data.autoBackup}
                    onChange={(e) => page.patch("data", { autoBackup: e.target.checked })}
                    aria-label="Automatic backups"
                  />
                  <span className="toggle-slider" />
                </label>
              </div>
              <div className="set-row">
                <div>
                  <div className="st-t">Restore Points</div>
                  <div className="st-s">
                    <span>{page.backups.length}</span> available · last{" "}
                    <span>{page.backups.length ? fmtDate(page.backups[0].at) : "—"}</span>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-ghost px-3 py-1.5 text-xs"
                  onClick={() => open("backup")}
                >
                  Manage
                </button>
              </div>
            </div>
            <div className="glass-card p-5 pb-1.5 mb-5">
              <h3 className="font-bold c-text sec-title mb-4">Import &amp; Export</h3>
              <div className="set-row">
                <div>
                  <div className="st-t">Export Settings</div>
                  <div className="st-s">Download your configuration as JSON or CSV</div>
                </div>
                <button
                  type="button"
                  className="btn-ghost px-3 py-1.5 text-xs"
                  onClick={() => open("export")}
                >
                  Export
                </button>
              </div>
              <div className="set-row">
                <div>
                  <div className="st-t">Import Settings</div>
                  <div className="st-s">Apply a configuration file from another branch</div>
                </div>
                <button
                  type="button"
                  className="btn-ghost px-3 py-1.5 text-xs"
                  onClick={() => open("import")}
                >
                  Import
                </button>
              </div>
            </div>
            <div className="dz p-5 pb-1.5">
              <div className="flex items-center gap-2 mb-3">
                <AlertOctagon className="w-[15px] h-[15px] c-red shrink-0" aria-hidden="true" />
                <h3 className="text-[13px] font-black c-red">Danger Zone</h3>
              </div>
              <div className="set-row">
                <div>
                  <div className="st-t">Reset All Settings</div>
                  <div className="st-s">Restore every section to factory defaults</div>
                </div>
                <button
                  type="button"
                  className="btn-ghost px-3 py-1.5 text-xs danger-link"
                  onClick={() => open("reset")}
                >
                  Reset
                </button>
              </div>
              <div className="set-row">
                <div>
                  <div className="st-t">Delete Account</div>
                  <div className="st-s">Permanently remove this account and all its data</div>
                </div>
                <button
                  type="button"
                  className="btn-danger px-3 py-1.5 text-xs"
                  onClick={() => open("delete")}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════ MODALS ══════════════ */}
      <SettingsPhotoModal
        key={`photo-${draft.profile.avatar}-${draft.profile.photo}`}
        open={modal === "photo"}
        name={draft.profile.name}
        avatar={draft.profile.avatar}
        photo={draft.profile.photo}
        onClose={close}
        onConfirm={page.confirmPhoto}
      />
      <SettingsPaymentModal
        key={`payment-${draft.billing.card.last4}`}
        open={modal === "payment"}
        card={draft.billing.card}
        onClose={close}
        onConfirm={page.confirmPayment}
      />
      <SettingsPlanModal
        key={`plan-${draft.billing.plan}`}
        open={modal === "plan"}
        currentPlan={draft.billing.plan}
        onClose={close}
        onConfirm={page.confirmPlan}
      />
      <SettingsInvoicesModal
        open={modal === "invoices"}
        onClose={close}
        onDownload={page.downloadInvoice}
        onExportAll={page.exportInvoices}
      />
      <SettingsSessionsModal
        open={modal === "sessions"}
        sessions={page.sessions}
        onClose={close}
        onSignOutOne={page.signOutOne}
        onSignOutAll={() => {
          if (page.sessions.some((s) => !s.current)) setModal("signout");
        }}
      />
      <SettingsSignoutModal
        open={modal === "signout"}
        sessions={page.sessions}
        onClose={close}
        onConfirm={page.confirmSignout}
      />
      <SettingsResetModal
        key={modal === "reset" ? `reset-${activeTab}` : "reset-closed"}
        open={modal === "reset"}
        activeTab={activeTab}
        onClose={close}
        onConfirm={page.confirmReset}
      />
      <SettingsBackupModal
        open={modal === "backup"}
        backups={page.backups}
        onClose={close}
        onNew={page.newBackup}
        onDownload={() => page.downloadBackup()}
        onRestore={(id) => {
          setRestoreTarget(BACKUPS.find((b) => b.id === id) ?? page.backups.find((b) => b.id === id) ?? null);
          setModal("restore");
        }}
      />
      <SettingsRestoreModal
        backup={modal === "restore" ? restoreTarget : null}
        onClose={close}
        onConfirm={page.confirmRestore}
      />
      <SettingsImportModal
        key={modal === "import" ? "import-open" : "import-closed"}
        open={modal === "import"}
        draft={draft}
        onClose={close}
        onConfirm={page.confirmImport}
      />
      <SettingsExportModal
        key={modal === "export" ? "export-open" : "export-closed"}
        open={modal === "export"}
        onClose={close}
        onConfirm={page.exportSettings}
      />
      <SettingsKeyNewModal
        key={modal === "key-new" ? "key-new-open" : "key-new-closed"}
        open={modal === "key-new"}
        existing={page.apiKeys}
        onClose={close}
        onCreate={createKey}
      />
      <SettingsKeyViewModal
        open={modal === "key-view"}
        code={newKey.code}
        meta={newKey.meta}
        onClose={close}
        onCopy={page.copyKey}
      />
      <SettingsKeyRevokeModal
        apiKey={modal === "key-revoke" ? revokeTarget : null}
        onClose={close}
        onConfirm={page.confirmRevoke}
      />
      <SettingsSmtpModal
        key={modal === "smtp" ? "smtp-open" : "smtp-closed"}
        open={modal === "smtp"}
        smtp={draft.smtp}
        defaultTo={draft.profile.email}
        outcome={page.smtpTestOutcome}
        onClose={close}
        onResult={page.smtpResult}
      />
      <SettingsDeleteModal
        key={modal === "delete" ? "delete-open" : "delete-closed"}
        open={modal === "delete"}
        gymName={draft.business.gymName}
        onClose={close}
        onConfirm={page.confirmDelete}
        onInvalidAck={page.invalidAck}
      />

      <Toast message={page.toast.message} visible={page.toast.visible} />
    </>
  );
};

export default Settings;

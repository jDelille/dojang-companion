/* Settings types — ported from tailwind/src/assets/js/settings.js */

export type SettingsSection =
  | "profile"
  | "business"
  | "notifications"
  | "security"
  | "billing"
  | "appearance"
  | "smtp"
  | "data";

/** Nav tab ids — the API tab owns the "smtp" model section. */
export type SettingsTab =
  | "profile"
  | "business"
  | "notifications"
  | "security"
  | "billing"
  | "appearance"
  | "api"
  | "data";

export type ProfileSettings = {
  name: string;
  email: string;
  phone: string;
  role: string;
  bio: string;
  avatar: string;
  photo: string;
};

export type BusinessSettings = {
  gymName: string;
  ein: string;
  email: string;
  phone: string;
  currency: string;
  timezone: string;
  address: string;
};

export type NotificationKey =
  | "newMembers"
  | "payments"
  | "lowStock"
  | "expiries"
  | "bookings"
  | "dailyEmail"
  | "marketing";

export type NotificationSettings = Record<NotificationKey, boolean>;

export type SecuritySettings = {
  twoFactor: boolean;
  loginAlerts: boolean;
  timeout: string;
};

export type CardDetails = {
  last4: string;
  exp: string;
  bank: string;
  name: string;
};

export type BillingSettings = {
  plan: string;
  card: CardDetails;
};

export type AppearanceSettings = {
  mode: string;
  accent: string;
  theme: string;
  sidebar: string;
  header: string;
  fixedHeader: boolean;
  width: string;
  radius: string;
  font: string;
  animations: boolean;
  compact: boolean;
  autoCollapse: boolean;
};

export type SmtpSettings = {
  host: string;
  port: number | "";
  user: string;
  from: string;
  encryption: string;
};

export type DataSettings = {
  autoBackup: boolean;
};

export type SettingsModel = {
  profile: ProfileSettings;
  business: BusinessSettings;
  notifications: NotificationSettings;
  security: SecuritySettings;
  billing: BillingSettings;
  appearance: AppearanceSettings;
  smtp: SmtpSettings;
  data: DataSettings;
};

export type Session = {
  id: number;
  device: string;
  where: string;
  ip: string;
  last: string;
  current: boolean;
};

export type Invoice = {
  id: string;
  date: string;
  amount: number;
  status: string;
};

export type ApiKey = {
  id: number;
  name: string;
  prefix: string;
  scopes: string[];
  created: string;
  lastUsed: string | null;
  expires: string | null;
};

export type Backup = {
  id: number;
  name: string;
  at: string;
  size: string;
  auto: boolean;
};

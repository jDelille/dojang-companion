import {
  Ban,
  Briefcase,
  Calculator,
  Circle,
  ConciergeBell,
  DoorOpen,
  Dumbbell,
  Fingerprint,
  Hash,
  KeyRound,
  LogIn,
  LogOut,
  QrCode,
  ScanFace,
  ScanLine,
  Shield,
  ShieldAlert,
  ShieldCheck,
  WifiOff,
  type LucideIcon,
} from "lucide-react";

/*
   Icon maps for Access Control, ported from METHOD_ICON, TYPE_META and the
   device / role / alert icon strings in tailwind/src/assets/js/access-control.js.
   *_FALLBACK cover the template's `METHOD_ICON[...] || 'circle'` default and the
   `icon: 'shield'` used for newly-created roles.
*/

/** Device icon strings on DEVICES, plus new-role default. */
export const DEVICE_ICON: Record<string, LucideIcon> = {
  "door-open": DoorOpen,
  "scan-line": ScanLine,
  "key-round": KeyRound,
  fingerprint: Fingerprint,
};

/** METHOD_ICON on the live log method chips. */
export const METHOD_ICON: Record<string, LucideIcon> = {
  RFID: ScanLine,
  Face: ScanFace,
  Fingerprint: Fingerprint,
  PIN: Hash,
  "PIN + RFID": KeyRound,
  "RFID + Face": ScanFace,
  "Day Pass QR": QrCode,
  None: Ban,
};

export const METHOD_FALLBACK: LucideIcon = Circle;

/** TYPE_META icon strings for the log-row status icon. */
export const TYPE_ICON: Record<string, LucideIcon> = {
  "log-in": LogIn,
  "shield-alert": ShieldAlert,
  "log-out": LogOut,
};

/** Role card icon strings, plus the 'shield' default for new roles. */
export const ROLE_ICON: Record<string, LucideIcon> = {
  "shield-check": ShieldCheck,
  briefcase: Briefcase,
  dumbbell: Dumbbell,
  "concierge-bell": ConciergeBell,
  calculator: Calculator,
  shield: Shield,
};

export const ROLE_FALLBACK: LucideIcon = Shield;

/** Alert icon strings from renderAlerts(). */
export const ALERT_ICON: Record<string, LucideIcon> = {
  "wifi-off": WifiOff,
  "shield-alert": ShieldAlert,
};

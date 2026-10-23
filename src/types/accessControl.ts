/* Access Control types — ported from tailwind/src/assets/js/access-control.js */

export type DeviceStatus = "Online" | "Offline";

export type AccessDevice = {
  name: string;
  type: string;
  method: string;
  status: DeviceStatus;
  icon: string;
  battery: number;
};

export type AccessEventType = "Granted" | "Denied" | "Exit";

export type AccessEvent = {
  id: number;
  name: string;
  door: string;
  method: string;
  type: AccessEventType;
  time: string;
  reason: string;
};

export type AccessLevel = "Full" | "Elevated" | "Standard" | "Limited";

export type Role = {
  id: number;
  name: string;
  desc: string;
  level: AccessLevel;
  users: number;
  icon: string;
  perms: string[];
};

/** Fields the Add / Edit Role modal collects. */
export type RoleFormValues = {
  name: string;
  desc: string;
  level: AccessLevel;
};

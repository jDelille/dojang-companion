
/** Avatar colour classes, picked by hashing a record's id. */
export const AVATAR_CLASSES = [
  "av-gold",
  "av-purple",
  "av-orange",
  "av-cyan",
  "av-green",
  "av-red",
];

export const money = (value: number): string =>
  "$" +
  Number(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export const moneyWhole = (value: number): string => "$" + value.toLocaleString("en-US");

/** Compact USD for KPI tiles: 82400 -> "$82.4K", 1200000 -> "$1.2M". */
export const usd = (value: number): string => {
  const v = Number(value) || 0;
  if (v >= 1e6) return "$" + (v / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
  if (v >= 1e3) return "$" + (v / 1e3).toFixed(1).replace(/\.0$/, "") + "K";
  return "$" + v;
};
export const number = (value: number): string => value.toLocaleString("en-US");

export const round2 = (value: number): number => Math.round(value * 100) / 100;

/** "Ashley Bennett" -> "AB" (first two words only). */
export const initials = (name: string): string =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
export const hashString = (value: string): number => {
  let hash = 0;
  for (let i = 0; i < value.length; i++) hash = (hash << 5) - hash + value.charCodeAt(i);
  return hash;
};

export const avatarFor = (id: string): string =>
  AVATAR_CLASSES[Math.abs(hashString(id)) % AVATAR_CLASSES.length];

export const formatSeedDate = (date: Date | null | undefined, fallback: string): string =>
  date
    ? date.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })
    : fallback;

import type { Member } from "./member";

// Ported from Companion 1cab554b src/domain/member-presentation.ts

export const membershipLabel = (member: Member) =>
  ({
    active: "Active",
    paused: "Paused",
    trial: "Trial",
    lead: "Lead",
    cancelled: "Cancelled",
  })[member.membershipState];

// "Blue Belt · 92% ready", or just the rank when readiness isn't known
export const memberSummary = (member: Member) => {
  if (member.testReadiness === undefined) return member.rank.name;
  return `${member.rank.name} · ${member.testReadiness}% ready`;
};

// "Maya Chen" -> "MC"
export const memberInitials = (member: Member) =>
  member.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("");

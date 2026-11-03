// DreamOS replacement for Roster's clsx/tailwind-merge dependency seam.
// This slice passes class strings/conditions only, without conflicting overrides.
// Deliberately no utility conflict resolution or general clsx object API.
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

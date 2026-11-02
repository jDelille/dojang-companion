import type { SessionRoster } from "@/domain/arrivals";
import type { CompanionContext } from "@/domain/companion";
import { rosterGroups } from "@/domain/instructor";
import type { TodaySession } from "@/domain/today";

/*
   What the Do For Me rail shows on the Instructor workspace ("Class context"):
   the focus class's numbers from its Odoo roster. Plain facts, never
   suggestions: Do For Me has no class recommendations, lesson plans or class
   prompts yet, and nothing here is AI.
*/

const NO_RECOMMENDATIONS =
  "Do For Me has no class recommendations yet. Lesson plans and class prompts aren't connected.";

export function instructorRailContext(
  session: TodaySession | null,
  roster: SessionRoster | null, // null while loading or when it couldn't be read
): CompanionContext {
  if (!session) {
    return {
      label: "Class context",
      intelTitle: "No class",
      intel: [],
      guidance: "No classes left today in Odoo.",
      suggestions: [],
      receipts: [],
    };
  }
  const intel = [{ label: "Class", value: session.title }];
  if (roster) {
    const groups = rosterGroups(roster);
    intel.push(
      { label: "Instructor", value: roster.session.instructor ?? "None assigned" },
      { label: "Booked", value: String(roster.members.length) },
      { label: "Here", value: String(groups.here.length) },
      { label: "Not here yet", value: String(groups.notHere.length) },
    );
  }
  return {
    label: `Class context · ${session.title}`,
    intelTitle: "This class",
    intel,
    guidance: roster ? NO_RECOMMENDATIONS : `The roster isn't loaded. ${NO_RECOMMENDATIONS}`,
    suggestions: [],
    receipts: [],
  };
}

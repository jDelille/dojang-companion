import type { CompanionContext, Suggestion } from "./companion";

// A button selects a review or presents the existing record context. It never
// executes an action, constructs business facts or claims a model answered.
export function doForMeActivation(context: CompanionContext): {
  tab: "plan" | "work" | "evidence";
  picked: Suggestion | null;
  message: string;
  summary?: string;
} {
  const picked = context.featured?.suggestion ?? context.suggestions[0] ?? null;
  if (picked) return {
    tab: picked.review === "page" ? "evidence" : "work",
    picked,
    message: picked.review === "page"
      ? "The action review is open on the page. Review the evidence and proposed changes before applying. Nothing has been executed."
      : "The proposal is open in Work. Execution availability is shown there. Nothing has been executed.",
  };
  return {
    tab: "plan",
    picked: null,
    summary: context.intel.length > 0
      ? context.intel.slice(0, 4).map((fact) => `${fact.label}: ${fact.value}`).join(" · ")
      : context.guidance,
    message: context.links?.length
      ? "Your context is open below. Choose a linked record to handle the next step. No action has been executed."
      : "Your record context is open below. Ask Companion about supported member or site facts. No action has been executed.",
  };
}

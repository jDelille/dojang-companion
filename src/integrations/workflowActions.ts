import type { PrepareLeadActionPayload } from "@/domain/hubAction";
import type { HubRequest } from "@/domain/workflow/actions";
import type { ActionExecutor } from "@/domain/workflow/run";
import { prepareLeadAction } from "./hub";

/*
   The workflow engine's ActionExecutor (src/domain/workflow/run.ts): sends one
   approved, prepared Hub request through /api/hub, from the browser of the
   staff member approving it, so the Hub sees that staff member as the actor.

   Only operations the DreamOS gateway forwards are sent (today just
   prepare_lead_action, kind follow_up, hub-gateway.ts FORWARDED_ACTIONS).
   Anything else is refused here without a request: an engine binding to
   another operation must not reach the Hub before the gateway allows it.

   Nothing calls this yet. The approval screen that would is waiting on the
   decisions in docs/WORKFLOW-ENGINE.md (where runs are stored, who runs due steps).
*/

function followUpPayload(payload: Record<string, unknown>): PrepareLeadActionPayload | null {
  const { leadId, expectedVersion, kind, reason, due } = payload;
  if (Object.keys(payload).sort().join() !== "due,expectedVersion,kind,leadId,reason") return null;
  if (typeof leadId !== "string" || typeof reason !== "string" || typeof due !== "string") return null;
  if (typeof expectedVersion !== "number" || kind !== "follow_up") return null;
  return { leadId, expectedVersion, kind, reason, due };
}

export const executeWorkflowAction: ActionExecutor = async (request: HubRequest, requestKey: string) => {
  if (request.operation !== "prepare_lead_action") return { status: "rejected", code: "HUB_READ_ONLY" };
  const payload = followUpPayload(request.payload);
  if (!payload) return { status: "rejected", code: "INVALID_COMMAND" };

  const answer = await prepareLeadAction(payload, requestKey);
  if (answer.outcome === "done") {
    return { status: "confirmed", receiptId: answer.result.taskId, replayed: answer.result.replayed };
  }
  if (answer.outcome === "failed") return { status: "rejected", code: answer.code };
  return { status: "uncertain" };
};

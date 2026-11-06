import {saveUnconfirmedAttendance,clearConfirmedAttendance} from './attendanceRecovery';
import type {
  CheckInResult,
  ProblemCode,
  ProblemDetails,
  RecordId,
  RosterMember,
  SessionOption,
} from "@/contracts/kiosk-attendance";
import type { CheckInCommand } from "@/domain/kiosk/checkInCommand";
import type { CheckInAnswer } from "@/domain/kiosk/checkInOutcome";
import { CHECK_IN_TIMEOUT_SECONDS } from "@/domain/kiosk/kioskConfig";

// The only place kiosk screens get data from. Calls the /api/v2 routes, which
// select explicit Odoo test session reads or development fixtures on the server.
// Connected roster and attendance use the paired kiosk scope and native checks.
// Ported from Companion 1cab554b src/integrations/kiosk.ts.

// Today's sessions. The server decides what "today" means.
export async function getSessions(
  signal?: AbortSignal, // aborted when the kiosk leaves the step (e.g. Back)
): Promise<SessionOption[]> {
  const response = await fetch("/api/v2/sessions", { cache: "no-store", signal });
  if (!response.ok) {
    throw new Error(`Sessions request failed (${response.status})`);
  }
  return response.json();
}

// Only students registered for the selected, device-authorized test session.
// Presentation follows Jodi's configured tap-your-name grid or search-only mode.
export async function getRoster(
  sessionId: RecordId,
  signal?: AbortSignal, // aborted when the kiosk leaves the step (e.g. Change class)
): Promise<RosterMember[]> {
  const response = await fetch(
    `/api/v2/sessions/${encodeURIComponent(sessionId)}/roster`,
    { cache: "no-store", signal },
  );
  if (!response.ok) {
    throw new Error(`Roster request failed (${response.status})`);
  }
  return response.json();
}

// Sends the check-in command. Never throws: whatever happens comes back as an
// answer, and anything we can't trust as a reply counts as "noAnswer" (not confirmed).
// Gives up after CHECK_IN_TIMEOUT_SECONDS. The request is actually cancelled then,
// so a very late reply can't arrive. The server may still have saved it, which the
// retry with the same idempotency key sorts out.
//
// Connected devices can retain encrypted unconfirmed attempts for bounded recovery.
export async function checkIn(
  command: CheckInCommand,
  signal: AbortSignal, // aborted by the page if the kiosk leaves this step
): Promise<CheckInAnswer> {
  let response: Response;
  try {
    // Inside the try: a browser without AbortSignal.any/timeout gets "not
    // confirmed" instead of a thrown error that would leave the screen sending
    const timeout = AbortSignal.timeout(CHECK_IN_TIMEOUT_SECONDS * 1000);
    response = await fetch("/api/v2/attendance/check-ins", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(command),
      cache: "no-store",
      signal: AbortSignal.any([signal, timeout]),
    });
  } catch {
    if(!signal.aborted)await saveUnconfirmedAttendance(command);
    return { kind: "noAnswer" }; // offline, cancelled or timed out
  }

  const body = await response.json().catch(() => null);

  if (response.ok && isResultFor(body, command)) {
    if(body.receipt.memberId===command.payload.memberId&&body.receipt.sessionId===command.payload.sessionId)await clearConfirmedAttendance(command);
    return { kind: "result", result: body };
  }
  if (!response.ok && isKnownProblem(body)) {
    return { kind: "problem", problem: body };
  }
  if(!signal.aborted)await saveUnconfirmedAttendance(command);
  return { kind: "noAnswer" }; // e.g. a bare 503, or a body that isn't either shape
}

// Stricter than Companion's check (which only looked at attendanceId): a reply
// only counts if it is a whole CheckInResult for THIS attempt. Whether the receipt
// names the right student and class is outcomeFor()'s job, not repeated here.
const isResultFor = (body: unknown, command: CheckInCommand): body is CheckInResult => {
  const result = body as CheckInResult | null;
  const receipt = result?.receipt;
  return (
    typeof receipt?.attendanceId === "string" &&
    typeof receipt.memberId === "string" &&
    typeof receipt.sessionId === "string" &&
    (receipt.status === "present" || receipt.status === "late") &&
    typeof receipt.alreadyRecorded === "boolean" &&
    typeof receipt.checkedInAt === "string" &&
    Number.isFinite(Date.parse(receipt.checkedInAt)) &&
    typeof result?.replayed === "boolean" &&
    // The contract: the top-level correlationId is the current attempt's
    result.correlationId === command.correlationId
  );
};

// Every code in the contract. Being a Record means a new code won't compile until it's listed.
const knownProblemCodes: Record<ProblemCode, true> = {
  INVALID_COMMAND: true,
  FORBIDDEN: true,
  SESSION_UNAVAILABLE: true,
  SESSION_NOT_OPEN: true,
  MEMBER_UNAVAILABLE: true,
  NOT_ON_ROSTER: true,
  ELIGIBILITY_REVIEW_REQUIRED: true,
  ATTENDANCE_REVIEW_REQUIRED: true,
  VERSION_CONFLICT: true,
  IDEMPOTENCY_CONFLICT: true,
  CONCURRENT_RETRY: true,
  CAPABILITY_DISABLED: true,
};

// An unknown code would have no outcome on the Result screen, so it counts as no answer
const isKnownProblem = (body: unknown): body is ProblemDetails => {
  const code = (body as ProblemDetails | null)?.code;
  return typeof code === "string" && Object.hasOwn(knownProblemCodes, code);
};

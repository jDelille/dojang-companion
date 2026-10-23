// DEVELOPMENT-ONLY mock of the kiosk attendance API. Every class and person here is fictional.
// Never contacts Odoo or any other service. Disabled when NODE_ENV is "production".
//
// Ported from Companion 1cab554b (src/integrations/mock/kiosk.ts, kiosk-store.ts, kiosk-http.ts,
// routes/{sessions,roster,checkins}.ts) with three differences:
//   - no Companion members on the rosters, kiosk-only fictional students
//   - no dev scenario switch and no NEXT_PUBLIC_DEMO_MODE flag
//   - stricter command validation, matching Companion's Odoo gateway (unknown fields, body size)
//
// Relative imports only, so tools/test-kiosk-domain.sh can compile it with plain tsc.

import {
  buildCheckIn,
  type AttendanceReceipt,
  type CheckInPayload,
  type CheckInResult,
  type CommandEnvelope,
  type ProblemCode,
  type ProblemDetails,
  type RecordId,
  type RosterMember,
  type SessionOption,
} from "../contracts/kiosk-attendance";

// ---------------------------------------------------------------------------
// Fictional seed data (development only)

const MOCK_LOCATION = "Mock Dojang (development only)";

type SessionSeed = {
  sessionId: RecordId;
  title: string;
  startTime: string; // "16:00", server's local time
  endTime: string;
  version: number;
  capacity: number;
};

const sessionSeeds: SessionSeed[] = [
  { sessionId: "101", title: "Little Dragons", startTime: "16:00", endTime: "16:45", version: 1, capacity: 12 },
  { sessionId: "102", title: "Junior Taekwondo", startTime: "17:00", endTime: "18:00", version: 3, capacity: 8 }, // one under full
  { sessionId: "103", title: "Adult Taekwondo", startTime: "18:30", endTime: "19:30", version: 2, capacity: 20 },
];

const student = (
  memberId: RecordId,
  displayName: string,
  attendanceState: RosterMember["attendanceState"] = "pending",
): RosterMember => ({ memberId, displayName, enrollmentStatus: "registered", attendanceState });

// Jamie is on both 101 and 103 so we can check rosters really are per session
const jamie = student("3001", "Jamie H.");

const rosterSeeds: Record<RecordId, RosterMember[]> = {
  "101": [student("1001", "Eli B."), student("1002", "Ivy C."), student("1003", "Kai D."), jamie],
  // Almost full, and has all the edge cases
  "102": [
    student("2001", "Ava M."),
    student("2002", "Ava N."), // close to Ava M.
    student("2003", "Leo P.", "present"), // already checked in
    student("2004", "Mia R.", "excused"),
    student("2005", "Noah S.", "absent"),
    student("2006", "Zoe T."), // not eligible (see ineligibleMemberIds)
    student("2007", "Ben A."),
  ],
  "103": [jamie, student("3002", "Alicia P."), student("3003", "Ben K.")],
};

// Eligibility isn't in the contract, so this stays server side and never goes to the browser
const ineligibleMemberIds = ["2006"];

// PROVISIONAL: made up for the mock, not a real rule. The contract just says a receipt
// can be "late", and when that happens is up to Jodi. Don't write UI copy around 10 minutes.
const PROVISIONAL_LATE_AFTER_MINUTES = 10;

const MAX_BODY_BYTES = 8192; // same limit as Companion's Odoo gateway

// ---------------------------------------------------------------------------
// HTTP helpers

const baseHeaders = {
  "cache-control": "private, no-store",
  "x-dojang-data-source": "mock", // the Odoo gateway sends "odoo-test" here
};

// PROVISIONAL: the contract has the codes but not the HTTP status or title for each.
// Same guesses as Companion's mock, so the UI should check `code`, not `status`.
const problemInfo: Record<ProblemCode, { status: number; title: string }> = {
  INVALID_COMMAND: { status: 400, title: "Invalid command" },
  FORBIDDEN: { status: 403, title: "Forbidden" },
  SESSION_UNAVAILABLE: { status: 404, title: "Session unavailable" },
  SESSION_NOT_OPEN: { status: 409, title: "Session not open for check-in" },
  MEMBER_UNAVAILABLE: { status: 404, title: "Member unavailable" },
  NOT_ON_ROSTER: { status: 422, title: "Not on roster" },
  ELIGIBILITY_REVIEW_REQUIRED: { status: 422, title: "Eligibility review required" },
  ATTENDANCE_REVIEW_REQUIRED: { status: 409, title: "Attendance review required" },
  VERSION_CONFLICT: { status: 409, title: "Session changed" },
  IDEMPOTENCY_CONFLICT: { status: 409, title: "Idempotency key reused" },
  CONCURRENT_RETRY: { status: 409, title: "Retry already in progress" },
  CAPABILITY_DISABLED: { status: 503, title: "Capability disabled" },
};

const json = (body: unknown, status = 200) => Response.json(body, { status, headers: baseHeaders });

function problem(code: ProblemCode, correlationId: string, detail: string): Response {
  const { status, title } = problemInfo[code];
  const body: ProblemDetails = {
    type: `urn:dojang:problem:${code}`, // PROVISIONAL: contract doesn't say what this should look like
    title,
    status,
    code,
    detail,
    correlationId,
  };
  return Response.json(body, {
    status,
    headers: { ...baseHeaders, "content-type": "application/problem+json" },
  });
}

const recordId = (value: unknown): value is string =>
  typeof value === "string" && /^[1-9][0-9]{0,9}$/.test(value) && Number(value) <= 2147483647;
const requestKey = (value: unknown): value is string =>
  typeof value === "string" && /^[A-Za-z0-9][A-Za-z0-9_.:-]{15,127}$/.test(value);

// Fallback for when there's no usable correlationId in the body. Only echoes a well-formed header.
function correlationIdFrom(request: Request): string {
  const fromHeader = request.headers.get("x-correlation-id");
  if (requestKey(fromHeader)) return fromHeader;
  return `kiosk-mock-${crypto.randomUUID()}`;
}

async function readJson(request: Request): Promise<unknown> {
  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > MAX_BODY_BYTES) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

// Exactly a CommandEnvelope<CheckInPayload>, nothing extra (no tenant, device or role from the caller)
function readCommand(body: unknown): CommandEnvelope<CheckInPayload> | null {
  if (!isObject(body)) return null;
  const allowed = ["idempotencyKey", "correlationId", "expectedVersion", "payload"];
  if (Object.keys(body).some((key) => !allowed.includes(key))) return null;
  const { idempotencyKey, correlationId, expectedVersion, payload } = body;
  if (!isObject(payload) || Object.keys(payload).length !== 2) return null;
  if (typeof idempotencyKey !== "string" || typeof correlationId !== "string") return null;
  if (typeof payload.sessionId !== "string" || typeof payload.memberId !== "string") return null;
  if (expectedVersion !== undefined && typeof expectedVersion !== "number") return null;
  return {
    idempotencyKey,
    correlationId,
    expectedVersion,
    payload: { sessionId: payload.sessionId, memberId: payload.memberId },
  };
}

// Reuses Jodi's buildCheckIn to validate the IDs and keys so we don't end up with our own rules.
// It only looks at the IDs, version and keys, the other fields are just filler.
function hasValidFormat(command: CommandEnvelope<CheckInPayload>): boolean {
  const session: SessionOption = {
    sessionId: command.payload.sessionId,
    version: command.expectedVersion ?? 0,
    title: "",
    startsAt: "",
    endsAt: "",
    capacity: 0,
    seatsTaken: 0,
  };
  const member: RosterMember = {
    memberId: command.payload.memberId,
    displayName: "",
    enrollmentStatus: "registered",
    attendanceState: "pending",
  };
  try {
    buildCheckIn(session, member, command);
    return true;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// The mock itself: in-memory store plus the three route handlers

type UsedKey = { checkIn: string; receipt: AttendanceReceipt };

export type KioskMockOptions = {
  now?: () => Date; // injectable clock so tests are deterministic
  enabled?: boolean; // defaults to NODE_ENV !== "production"
};

export type KioskMock = {
  sessions(request: Request): Response;
  roster(request: Request, sessionId: string): Response;
  checkIn(request: Request): Promise<Response>;
};

// Key for one student in one session, like "102:2003"
const checkInKey = (sessionId: RecordId, memberId: RecordId) => `${sessionId}:${memberId}`;

export function createKioskMock(options: KioskMockOptions = {}): KioskMock {
  const now = options.now ?? (() => new Date());
  const enabled = options.enabled ?? process.env.NODE_ENV !== "production";

  const attendance = new Map<string, RosterMember["attendanceState"]>();
  const receipts = new Map<string, AttendanceReceipt>();
  const usedKeys = new Map<string, UsedKey>();
  let nextAttendanceId = 9001;

  // Anyone seeded as present needs a receipt for the "already checked in" case
  const seededAt = now().toISOString();
  for (const [sessionId, roster] of Object.entries(rosterSeeds)) {
    for (const member of roster) {
      const key = checkInKey(sessionId, member.memberId);
      attendance.set(key, member.attendanceState);
      if (member.attendanceState === "present") {
        receipts.set(key, {
          attendanceId: String(nextAttendanceId++),
          memberId: member.memberId,
          sessionId,
          checkedInAt: seededAt,
          status: "present",
          alreadyRecorded: false,
          correlationId: `seed-front-desk-${member.memberId}`,
        });
      }
    }
  }

  // "17:00" -> today at 5pm (server local time) as an ISO string
  const todayAt = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number);
    const date = now();
    date.setHours(hours, minutes, 0, 0);
    return date.toISOString();
  };

  // Rebuilt every request so the dates are always today
  const todaysSessions = (): SessionOption[] =>
    sessionSeeds.map((seed) => ({
      sessionId: seed.sessionId,
      title: seed.title,
      startsAt: todayAt(seed.startTime),
      endsAt: todayAt(seed.endTime),
      version: seed.version,
      capacity: seed.capacity,
      seatsTaken: rosterSeeds[seed.sessionId].length,
      location: MOCK_LOCATION,
    }));

  // Roster with current attendance. undefined if the session doesn't exist
  const getRoster = (sessionId: RecordId): RosterMember[] | undefined =>
    rosterSeeds[sessionId]?.map((member) => ({
      ...member,
      attendanceState: attendance.get(checkInKey(sessionId, member.memberId)) ?? member.attendanceState,
    }));

  const disabled = (request: Request) =>
    problem("CAPABILITY_DISABLED", correlationIdFrom(request), "The kiosk mock API is development only.");

  const checkInResponse = (receipt: AttendanceReceipt, replayed: boolean, correlationId: string, status: number) => {
    const result: CheckInResult = { receipt, replayed, correlationId };
    return json(result, status);
  };

  return {
    // GET /api/v2/sessions -> SessionOption[]
    sessions(request) {
      if (!enabled) return disabled(request);
      return json(todaysSessions());
    },

    // GET /api/v2/sessions/{sessionId}/roster -> RosterMember[]
    roster(request, sessionId) {
      if (!enabled) return disabled(request);
      const correlationId = correlationIdFrom(request);
      if (!recordId(sessionId)) {
        return problem("INVALID_COMMAND", correlationId, "Invalid session id.");
      }
      const roster = getRoster(sessionId);
      if (!roster) {
        return problem("SESSION_UNAVAILABLE", correlationId, `No session ${sessionId} today.`);
      }
      return json(roster);
    },

    // POST /api/v2/attendance/check-ins, body CommandEnvelope<CheckInPayload> -> CheckInResult
    async checkIn(request) {
      if (!enabled) return disabled(request);

      const command = readCommand(await readJson(request));
      if (!command) {
        return problem("INVALID_COMMAND", correlationIdFrom(request), "Expected a CommandEnvelope<CheckInPayload>.");
      }
      if (!hasValidFormat(command)) {
        return problem(
          "INVALID_COMMAND",
          requestKey(command.correlationId) ? command.correlationId : correlationIdFrom(request),
          "Invalid attendance command inputs.",
        );
      }

      const { idempotencyKey, correlationId, expectedVersion } = command;
      const { sessionId, memberId } = command.payload;
      const thisCheckIn = checkInKey(sessionId, memberId);

      // Key's been used before: same check-in gets the original receipt back, anything else is a conflict
      const usedKey = usedKeys.get(idempotencyKey);
      if (usedKey) {
        if (usedKey.checkIn !== thisCheckIn) {
          return problem("IDEMPOTENCY_CONFLICT", correlationId, "This idempotency key was used for a different check-in.");
        }
        return checkInResponse(usedKey.receipt, true, correlationId, 200);
      }

      const session = todaysSessions().find((candidate) => candidate.sessionId === sessionId);
      if (!session) {
        return problem("SESSION_UNAVAILABLE", correlationId, `No session ${sessionId} today.`);
      }

      if (expectedVersion !== undefined && expectedVersion !== session.version) {
        return problem("VERSION_CONFLICT", correlationId, "The session changed. Reload it and try again.");
      }

      const member = getRoster(sessionId)?.find((rosterMember) => rosterMember.memberId === memberId);
      if (!member) {
        return problem("NOT_ON_ROSTER", correlationId, "This student isn't registered for this session.");
      }

      if (ineligibleMemberIds.includes(memberId)) {
        return problem("ELIGIBILITY_REVIEW_REQUIRED", correlationId, "Eligibility needs staff review.");
      }

      // Already checked in, so return the existing receipt instead of making a new one
      const existingReceipt = receipts.get(thisCheckIn);
      if (member.attendanceState === "present" && existingReceipt) {
        const receipt = { ...existingReceipt, alreadyRecorded: true };
        usedKeys.set(idempotencyKey, { checkIn: thisCheckIn, receipt });
        return checkInResponse(receipt, false, correlationId, 200);
      }

      if (member.attendanceState !== "pending") {
        return problem("ATTENDANCE_REVIEW_REQUIRED", correlationId, "Attendance needs staff review.");
      }

      // All good, record it (in memory only)
      const checkedInAt = now();
      const lateFrom = Date.parse(session.startsAt) + PROVISIONAL_LATE_AFTER_MINUTES * 60 * 1000;
      const receipt: AttendanceReceipt = {
        attendanceId: String(nextAttendanceId++),
        memberId,
        sessionId,
        checkedInAt: checkedInAt.toISOString(),
        status: checkedInAt.getTime() > lateFrom ? "late" : "present",
        alreadyRecorded: false,
        correlationId,
      };
      attendance.set(thisCheckIn, "present");
      receipts.set(thisCheckIn, receipt);
      usedKeys.set(idempotencyKey, { checkIn: thisCheckIn, receipt });

      return checkInResponse(receipt, false, correlationId, 201);
    },
  };
}

// One shared instance per server process. On globalThis so hot reload doesn't wipe it
// and every route bundle sees the same store. Restarting the server resets it.
const serverMemory = globalThis as typeof globalThis & { dojangKioskMock?: KioskMock };

export function devKioskMock(): KioskMock {
  serverMemory.dojangKioskMock ??= createKioskMock();
  return serverMemory.dojangKioskMock;
}

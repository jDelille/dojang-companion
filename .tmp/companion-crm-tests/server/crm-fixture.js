"use strict";
// DEVELOPMENT-ONLY CRM context for the Sales pipeline. Every person here is fictional;
// phone numbers use the reserved 555-01xx range and emails the .invalid domain.
// Only src/integrations/crm.ts reads this, and only outside production.
//
// Stages are Jodi's proposed set (implementation handoff, 9 Oct 2026, page 2):
// New > Contacted > Trial booked > Trial attended > Decision > Enrolled, with
// Lost kept apart. Jordan Parker and Riley Lee match Companion's front-desk sample.
Object.defineProperty(exports, "__esModule", { value: true });
exports.crmScenarios = void 0;
exports.devCrmContext = devCrmContext;
exports.devLeadDetails = devLeadDetails;
exports.isCrmScenario = isCrmScenario;
exports.devCrmScenario = devCrmScenario;
exports.setDevCrmScenario = setDevCrmScenario;
exports.resetDevCrm = resetDevCrm;
exports.devPrepareLeadAction = devPrepareLeadAction;
const hub_fixture_common_1 = require("./hub-fixture-common");
const member_fixture_1 = require("./member-fixture");
const STAGES = [
    { id: "stage-new", name: "New" },
    { id: "stage-contacted", name: "Contacted" },
    { id: "stage-trial-booked", name: "Trial booked" },
    { id: "stage-trial-attended", name: "Trial attended" },
    { id: "stage-decision", name: "Decision" },
    { id: "stage-enrolled", name: "Enrolled" },
];
const PEE_WEE = { id: "tag-pee-wee", name: "Pee Wee" };
const CHILDREN_BEGINNER = { id: "tag-children-beginner", name: "Children Beginner" };
const TEEN_ADULT = { id: "tag-teen-adult", name: "Teen & Adult" };
const MASTER_KIM = { ownerId: "user-kim", owner: "Master Kim" };
const JAMIE = { ownerId: "user-jamie", owner: "Jamie Ortiz" };
const UNASSIGNED = { ownerId: null, owner: "Unassigned" };
// The stage's id and name together, so the two can't disagree
function inStage(name) {
    const stage = STAGES.find((each) => each.name === name);
    if (!stage)
        throw new Error(`Unknown sample stage: ${name}`);
    return { stageId: stage.id, stage: stage.name };
}
const LEADS = [
    {
        id: "9001",
        name: "Ava Martinez",
        contact: "Rosa Martinez (parent)",
        email: "rosa.martinez@example.invalid",
        phone: "(555) 010-0101",
        ...inStage("New"),
        ...UNASSIGNED,
        source: "Website",
        tags: [PEE_WEE],
    },
    {
        id: "9002",
        name: "Ethan Brooks",
        contact: "Ethan Brooks",
        email: "ethan.brooks@example.invalid",
        phone: "",
        ...inStage("New"),
        ...JAMIE,
        source: "Walk-in",
        tags: [TEEN_ADULT],
    },
    {
        id: "9003",
        name: "Lily Tran",
        contact: "Mai Tran (parent)",
        email: "",
        phone: "(555) 010-0103",
        ...inStage("Contacted"),
        ...JAMIE,
        source: "Referral",
        tags: [CHILDREN_BEGINNER],
    },
    {
        id: "9004",
        name: "Noah Kim",
        contact: "Daniel Kim (parent)",
        email: "daniel.kim@example.invalid",
        phone: "(555) 010-0104",
        ...inStage("Contacted"),
        ...MASTER_KIM,
        source: "Facebook",
        tags: [CHILDREN_BEGINNER],
    },
    {
        id: "9005",
        name: "Jordan Parker",
        contact: "Parker Family (guardian)",
        email: "",
        phone: "(555) 010-0105",
        ...inStage("Trial booked"),
        ...JAMIE,
        source: "Kiosk trial request",
        tags: [PEE_WEE],
    },
    {
        id: "9006",
        name: "Riley Lee",
        contact: "Lee Family (guardian)",
        email: "lee.family@example.invalid",
        phone: "",
        ...inStage("Trial booked"),
        ...MASTER_KIM,
        source: "Website",
        tags: [CHILDREN_BEGINNER],
    },
    {
        id: "9007",
        name: "Mia Rossi",
        contact: "Elena Rossi (parent)",
        email: "elena.rossi@example.invalid",
        phone: "(555) 010-0107",
        ...inStage("Trial attended"),
        ...MASTER_KIM,
        source: "Referral",
        tags: [CHILDREN_BEGINNER],
    },
    {
        id: "9008",
        name: "Owen Price",
        contact: "Owen Price",
        email: "owen.price@example.invalid",
        phone: "(555) 010-0108",
        ...inStage("Decision"),
        ...JAMIE,
        source: "Website",
        tags: [TEEN_ADULT],
    },
    {
        id: "9009",
        name: "Grace Park",
        contact: "Hannah Park (parent)",
        email: "",
        phone: "(555) 010-0109",
        ...inStage("Enrolled"),
        ...MASTER_KIM,
        source: "Walk-in",
        tags: [PEE_WEE],
    },
    {
        id: "9010",
        name: "Leo Novak",
        contact: "Leo Novak",
        email: "leo.novak@example.invalid",
        phone: "",
        ...inStage("Contacted"),
        ...JAMIE,
        source: "Facebook",
        tags: [TEEN_ADULT],
        lostReason: "Class times don't fit",
    },
    {
        id: "9011",
        name: "Ruby Shah",
        contact: "Priya Shah (parent)",
        email: "priya.shah@example.invalid",
        phone: "(555) 010-0111",
        ...inStage("Trial attended"),
        ...MASTER_KIM,
        source: "Website",
        tags: [CHILDREN_BEGINNER],
        lostReason: "Chose another school",
    },
];
function devCrmContext() {
    return {
        stages: STAGES,
        leads: LEADS.map(currentLead),
        moreLeads: false,
        followUps: { outcome: "loaded", tasks: devFollowUps(), moreTasks: false },
        assignees: [
            { id: MASTER_KIM.ownerId, name: MASTER_KIM.owner },
            { id: JAMIE.ownerId, name: JAMIE.owner },
        ],
    };
}
// crm_context.tasks: every open task on a lead that isn't archived (lost), like
// the Hub, plus one on a sample member (src/server/member-fixture.ts) so member
// follow-ups show too
function devFollowUps() {
    const leadTasks = LEADS.filter((lead) => !lead.lostReason).flatMap((lead) => tasksOf(lead.id)
        .filter((task) => task.state !== "done")
        .map((task) => ({
        id: task.id,
        relatedType: "lead",
        relatedId: lead.id,
        relatedName: lead.name,
        summary: task.summary,
        due: task.due,
        owner: task.owner,
        state: task.state,
        version: 1,
        canComplete: true,
    })));
    const member = member_fixture_1.devMembers.find((each) => each.id === "5001");
    const memberTasks = member
        ? [
            {
                id: "task-member-5001-1",
                relatedType: "member",
                relatedId: member.id,
                relatedName: member.name,
                summary: "Call about missed classes",
                due: dayFromToday(1),
                owner: UNASSIGNED.owner,
                state: "planned",
                version: 1,
                canComplete: true,
            },
        ]
        : [];
    return [...leadTasks, ...memberTasks];
}
// ---------------------------------------------------------------------------
// Lead detail (C04). Dates are relative to today so trials and due tasks stay
// current. Jordan Parker and Riley Lee link to the sample members 5003 and 5007
// (src/server/member-fixture.ts) and have today's trials, like Companion's front desk.
// "2026-10-27" for today + offset days, in the server's time zone
function dayFromToday(offset) {
    const day = new Date();
    day.setDate(day.getDate() + offset);
    const month = String(day.getMonth() + 1).padStart(2, "0");
    const date = String(day.getDate()).padStart(2, "0");
    return `${day.getFullYear()}-${month}-${date}`;
}
// An open task due today + offset days
function openTask(id, summary, offset, owner) {
    let state = "planned";
    if (offset < 0)
        state = "overdue";
    if (offset === 0)
        state = "today";
    return { id, summary, due: dayFromToday(offset), owner, state, feedback: "" };
}
// ISO time for today + offset days at hour:minute (server time)
function at(offset, hour, minute) {
    const time = new Date();
    time.setDate(time.getDate() + offset);
    time.setHours(hour, minute, 0, 0);
    return time.toISOString();
}
const NO_EXTRAS = { tasks: [], memberId: null, trial: null, notes: [], timeline: [] };
function detailExtras(leadId) {
    switch (leadId) {
        case "9001":
            return {
                ...NO_EXTRAS,
                tasks: [openTask("task-9001-1", "Call to introduce the Pee Wee program", 0, "Jamie Ortiz")],
            };
        case "9003":
            return {
                ...NO_EXTRAS,
                tasks: [openTask("task-9003-1", "Follow up about a first class", 2, "Jamie Ortiz")],
                notes: [
                    { id: "note-9003-1", text: "Mai prefers text messages after 5 PM.", author: "Jamie Ortiz", at: at(-1, 17, 40) },
                ],
                timeline: [
                    { id: "receipt-9003-2", action: "create_task", actor: "Jamie Ortiz", at: at(-1, 17, 42) },
                    { id: "receipt-9003-1", action: "add_lead_note", actor: "Jamie Ortiz", at: at(-1, 17, 40) },
                ],
            };
        case "9005":
            return {
                tasks: [openTask("task-9005-1", "Confirm trial with guardian", 0, "Jamie Ortiz")],
                memberId: "5003",
                trial: { title: "Pee Wee", startsAt: at(0, 16, 15) },
                notes: [
                    { id: "note-9005-1", text: "Guardian asked what to wear for the first class.", author: "Jamie Ortiz", at: at(-1, 10, 5) },
                ],
                timeline: [
                    { id: "receipt-9005-2", action: "create_task", actor: "Jamie Ortiz", at: at(-1, 10, 8) },
                    { id: "receipt-9005-1", action: "reserve_trial", actor: "Jamie Ortiz", at: at(-1, 10, 2) },
                ],
            };
        case "9006":
            return {
                ...NO_EXTRAS,
                tasks: [openTask("task-9006-1", "Remind guardian to sign the waiver", 0, "Master Kim")],
                memberId: "5007",
                trial: { title: "Children Beginner", startsAt: at(0, 17, 0) },
                timeline: [{ id: "receipt-9006-1", action: "reserve_trial", actor: "Master Kim", at: at(-2, 14, 30) }],
            };
        case "9007":
            return {
                ...NO_EXTRAS,
                tasks: [
                    openTask("task-9007-2", "Discuss enrollment options", -1, "Master Kim"),
                    {
                        id: "task-9007-1",
                        summary: "Check in after the trial class",
                        due: dayFromToday(-2),
                        owner: "Master Kim",
                        state: "done",
                        feedback: "Mia enjoyed the class; family wants to compare schedules.",
                    },
                ],
                trial: { title: "Children Beginner", startsAt: at(-2, 17, 0) },
                timeline: [
                    { id: "receipt-9007-2", action: "complete_task", actor: "Master Kim", at: at(-2, 18, 10) },
                    { id: "receipt-9007-1", action: "reserve_trial", actor: "Master Kim", at: at(-4, 11, 0) },
                ],
            };
        case "9008":
            return {
                // No open task on purpose: the Hub's evidence then says "No open next
                // action is recorded." and recommends a follow-up (Do For Me suggests one)
                ...NO_EXTRAS,
                notes: [
                    { id: "note-9008-1", text: "Interested in evening classes only.", author: "Jamie Ortiz", at: at(-3, 19, 15) },
                ],
            };
        case "9010":
            return {
                ...NO_EXTRAS,
                notes: [
                    { id: "note-9010-1", text: "Weekday evenings don't work with his shifts.", author: "Jamie Ortiz", at: at(-6, 12, 0) },
                ],
            };
        default:
            return NO_EXTRAS;
    }
}
// null for an unknown lead. PROVISIONAL: lost leads open here in development;
// the Hub may not return archived (lost) leads at all.
function devLeadDetails(leadId) {
    const seed = LEADS.find((each) => each.id === leadId);
    if (!seed)
        return null;
    return {
        ...detailExtras(leadId),
        lead: currentLead(seed),
        tasks: tasksOf(leadId),
        timeline: timelineOf(leadId),
    };
}
// ---------------------------------------------------------------------------
// Writes (development only): prepare_lead_action, ported from Jodi's
// dojo_companion_hub (16 Oct 2026): service.py _dispatch and crm.py
// _prepare_lead_action / _task_create_for / _lead_evidence.
//
// One store per server process, on globalThis like kiosk-mock.ts so hot reload
// keeps it. Restarting the dev server resets it (or DELETE /api/dev/crm-scenario).
// Who "does" development writes: there's no staff sign-in yet. The Hub records
// the signed-in Odoo user, who must have an owner or manager grant.
const DEV_STAFF = "Staff (development)";
// The Hub's version is the lead's write time in microseconds; any number works here
const BASE_VERSION = 1;
// One-shot scenarios for trying the review's states. Each applies to the next
// write only, then goes back to "normal".
exports.crmScenarios = ["normal", "version-conflict", "reject", "lost-response"];
function isCrmScenario(value) {
    return exports.crmScenarios.includes(value);
}
const freshStore = () => ({
    versionBumps: {},
    addedTasks: {},
    addedTimeline: {},
    savedActions: {},
    nextId: 1,
    scenario: "normal",
});
const serverMemory = globalThis;
function store() {
    serverMemory.dojangCrmDev ??= freshStore();
    return serverMemory.dojangCrmDev;
}
function devCrmScenario() {
    return store().scenario;
}
function setDevCrmScenario(scenario) {
    store().scenario = scenario;
}
// Back to the sample data: drops every write and the scenario
function resetDevCrm() {
    serverMemory.dojangCrmDev = freshStore();
}
// Uses up a one-shot scenario: true when `scenario` was the one set
function takeScenario(scenario) {
    if (store().scenario !== scenario)
        return false;
    store().scenario = "normal";
    return true;
}
function versionOf(leadId) {
    return BASE_VERSION + (store().versionBumps[leadId] ?? 0);
}
// Odoo's activity state for a due date: overdue, today or planned
function stateFor(due) {
    const today = dayFromToday(0);
    if (due < today)
        return "overdue";
    if (due === today)
        return "today";
    return "planned";
}
// The Hub's order: open tasks first, then by due date, then by id
function tasksOf(leadId) {
    const added = (store().addedTasks[leadId] ?? []).map((task) => ({ ...task, state: stateFor(task.due) }));
    return [...detailExtras(leadId).tasks, ...added].sort((a, b) => {
        const aOpen = a.state === "done" ? 1 : 0;
        const bOpen = b.state === "done" ? 1 : 0;
        if (aOpen !== bOpen)
            return aOpen - bOpen;
        if (a.due !== b.due)
            return a.due < b.due ? -1 : 1;
        return a.id < b.id ? -1 : 1;
    });
}
function timelineOf(leadId) {
    return [...(store().addedTimeline[leadId] ?? []), ...detailExtras(leadId).timeline];
}
// crm.py _lead_evidence: the stage names that map to a journey
const JOURNEYS = {
    new: "New",
    contacted: "Contacted",
    qualified: "Contacted",
    trial: "Trial",
    "trial booked": "Trial",
    "trial-in-progress": "Trial",
    evaluation: "Evaluation",
    offer: "Offer",
    nurture: "Nurture",
    lost: "Lost",
};
// Odoo's crm.stage is_won. Enrolled is the sample pipeline's won stage.
const WON_STAGE_IDS = ["stage-enrolled"];
// crm.py _lead_evidence (priority, reason and next action), for the sample data
function evidenceOf(lead) {
    const extras = detailExtras(lead.id);
    const open = tasksOf(lead.id).filter((task) => task.state !== "done");
    const overdue = open.filter((task) => task.state === "overdue").length;
    const dueToday = open.filter((task) => task.state === "today").length;
    const trialLinked = extras.trial !== null;
    const memberLinked = extras.memberId !== null;
    let journey = JOURNEYS[lead.stage.trim().toLowerCase()] ?? "Stage review";
    if (lead.stageId && WON_STAGE_IDS.includes(lead.stageId))
        journey = "Won";
    // Sample data only: a lost lead is archived in Odoo, which the Hub doesn't list
    if (lead.lostReason)
        journey = "Lost";
    let priority = "Normal";
    let priorityReason = "Assigned work has no overdue or today-due task.";
    if (journey === "Won" || journey === "Lost") {
        priority = "Low";
        priorityReason = "The configured pipeline stage is terminal; review any outstanding work separately.";
    }
    else if (overdue) {
        priority = "Now";
        priorityReason = `${overdue} open task(s) are overdue.`;
    }
    else if (dueToday) {
        priority = "High";
        priorityReason = `${dueToday} open task(s) are due today.`;
    }
    else if (!lead.ownerId) {
        priority = "High";
        priorityReason = "No staff owner is assigned.";
    }
    else if (open.length === 0 && journey !== "Nurture") {
        priority = "High";
        priorityReason = "No open next action is recorded.";
    }
    else if (journey === "Nurture") {
        priority = "Low";
        priorityReason = "The configured stage is Nurture and no task is due today.";
    }
    let nextAction = "follow_up";
    if ((journey === "Offer" || journey === "Won") && !memberLinked)
        nextAction = "conversion";
    else if (journey === "Nurture" || journey === "Lost")
        nextAction = "reactivation";
    else if (!trialLinked && (journey === "New" || journey === "Contacted"))
        nextAction = "trial";
    return {
        journey,
        priority,
        priorityReason,
        nextAction,
        openTasks: open.length,
        overdueTasks: overdue,
        dueToday,
        trialLinked,
        memberLinked,
    };
}
function currentLead(seed) {
    return { ...seed, version: versionOf(seed.id), evidence: evidenceOf(seed) };
}
// crm.py _prepare_lead_action
const TASK_TITLES = {
    follow_up: "Prepare follow-up",
    trial: "Review trial options",
    reactivation: "Review reactivation",
    conversion: "Review member conversion",
};
function isIsoDate(value) {
    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value))
        return false;
    const date = new Date(`${value}T00:00:00Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
}
// A lead the Hub can write to: known, and not archived (lost)
function writableLead(leadId) {
    if (!(0, hub_fixture_common_1.isRecordId)(leadId))
        return null;
    return LEADS.find((each) => each.id === leadId && !each.lostReason) ?? null;
}
// POST /api/hub with operation "prepare_lead_action". `body: null` means no
// usable response (the "lost-response" scenario), like a dropped connection.
function devPrepareLeadAction(payload, requestKey) {
    const memory = store();
    const digest = (0, hub_fixture_common_1.fingerprint)({ operation: "prepare_lead_action", payload });
    // _dispatch: a used key replays its first result, or conflicts if the request differs
    const saved = memory.savedActions[requestKey];
    if (saved) {
        if (saved.fingerprint !== digest)
            return (0, hub_fixture_common_1.fail)("IDEMPOTENCY_CONFLICT");
        if (!writableLead(saved.leadId))
            return (0, hub_fixture_common_1.fail)("LEAD_UNAVAILABLE", 404);
        return { status: 200, body: { ...saved.response, replayed: true } };
    }
    if (takeScenario("reject"))
        return (0, hub_fixture_common_1.fail)("BUSINESS_RULE_REVIEW_REQUIRED", 422);
    // exact(p, "leadId expectedVersion kind reason due")
    const fields = ["due", "expectedVersion", "kind", "leadId", "reason"];
    if (!payload ||
        typeof payload !== "object" ||
        Object.keys(payload).sort().join() !== fields.join()) {
        return (0, hub_fixture_common_1.fail)("INVALID_COMMAND", 400);
    }
    const p = payload;
    const lead = writableLead(p.leadId);
    if (!lead)
        return (0, hub_fixture_common_1.fail)("LEAD_UNAVAILABLE", 404);
    // Someone else changed the lead after staff opened the review
    if (takeScenario("version-conflict")) {
        memory.versionBumps[lead.id] = (memory.versionBumps[lead.id] ?? 0) + 1;
    }
    if (typeof p.expectedVersion !== "number" || !Number.isInteger(p.expectedVersion) || p.expectedVersion !== versionOf(lead.id)) {
        return (0, hub_fixture_common_1.fail)("VERSION_CONFLICT");
    }
    if (typeof p.kind !== "string" || !(p.kind in TASK_TITLES))
        return (0, hub_fixture_common_1.fail)("INVALID_COMMAND", 400);
    const reason = (0, hub_fixture_common_1.cleanText)(p.reason, 800);
    if (!reason)
        return (0, hub_fixture_common_1.fail)("INVALID_COMMAND", 400);
    if (!isIsoDate(p.due))
        return (0, hub_fixture_common_1.fail)("INVALID_COMMAND", 400);
    // _task_create_for: one to-do activity on the lead, assigned to the caller.
    // The reason becomes its note (lead_details doesn't return notes of tasks).
    const number = memory.nextId++;
    const taskId = String(70000 + number);
    const summary = `${TASK_TITLES[p.kind]}: ${lead.name.slice(0, 150)}`.slice(0, 200);
    memory.addedTasks[lead.id] = [
        ...(memory.addedTasks[lead.id] ?? []),
        { id: taskId, summary, due: p.due, owner: DEV_STAFF, state: stateFor(p.due), feedback: "" },
    ];
    // The Hub's receipt (dojo.hub.receipt): shows in lead_details.timeline
    memory.addedTimeline[lead.id] = [
        { id: String(80000 + number), action: "prepare_lead_action", actor: DEV_STAFF, at: new Date().toISOString() },
        ...(memory.addedTimeline[lead.id] ?? []),
    ];
    const response = {
        leadId: lead.id,
        taskId,
        kind: p.kind,
        state: "prepared",
        messageSent: false,
        bookingCreated: false,
        membershipCreated: false,
    };
    memory.savedActions[requestKey] = { fingerprint: digest, leadId: lead.id, response };
    // Saved, but the answer never reaches the browser: a retry with the same key replays it
    if (takeScenario("lost-response"))
        return { status: 503, body: null };
    return { status: 200, body: { ...response, replayed: false } };
}

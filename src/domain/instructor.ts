import { ARRIVED_STATES, EXPECTED_STATES, type RosterMember, type SessionRoster } from "./arrivals";
import type { TodaySession } from "./today";

/*
   The Instructor workspace (Paul's §12 Instructor mode and Instructor Focus):
   class first. Built only from reads DreamOS already makes:

   - context         today's classes that haven't ended. For an instructor grant
                     the Hub sends only the classes assigned to them, so "my
                     classes" is Odoo's scope, never worked out here.
   - session_roster  one class's booked members, attendance and instructor

   What the Hub doesn't send, so the workspace says "Not connected" instead of
   showing a value: training area / studio, capacity, readiness, lesson plan,
   class notes. Check In and Start Class have no Hub action DreamOS forwards.
*/

// The class to teach: the one in progress, otherwise the next one. The Hub's
// context read leaves out classes that have ended and sends the rest soonest
// first, so it's the first of today's.
export function focusClassOf(sessions: TodaySession[]): TodaySession | null {
  return sessions[0] ?? null;
}

// The roster split the way an instructor reads it at the door
export function rosterGroups(roster: SessionRoster) {
  const here: RosterMember[] = [];
  const notHere: RosterMember[] = []; // booked, nothing recorded yet
  const recorded: RosterMember[] = []; // absent, excused, sick… (recorded, not here)
  for (const member of roster.members) {
    if (ARRIVED_STATES.includes(member.attendance)) here.push(member);
    else if (EXPECTED_STATES.includes(member.attendance)) notHere.push(member);
    else recorded.push(member);
  }
  return { here, notHere, recorded };
}

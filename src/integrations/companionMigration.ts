import { migrationReadResultAllowed } from '@/domain/companionMigration';
import { operationsReportFrom } from '@/domain/operations';
import { object as obj, recordId as id, string as str } from '@/domain/memberActions';
export const MIGRATION_AUTH_LOST = 'dojang-migration-auth-lost';
// Adapted screens use the same BFF. Reject unreadable snapshots before any screen
// can turn missing fields into zero; this never substitutes development records.
export async function workflowFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
 const body = JSON.parse(String(init?.body));
 const signal = AbortSignal.any([...(init?.signal ? [init.signal] : []), AbortSignal.timeout(45000)]);
 const response = await globalThis.fetch(input,{...init,signal});
 const v: unknown = await response.clone().json();
 if (!response.ok) { if(obj(v)&&obj(v.error)&&['SIGN_IN_REQUIRED','UNAUTHENTICATED'].includes(String(v.error.code))) window.dispatchEvent(new Event(MIGRATION_AUTH_LOST)); return response; }
 const op=body.operation,p=body.payload;
 let valid = migrationReadResultAllowed(op,p,v);
 if(op==='operations_report') valid=operationsReportFrom(v,p)!==null;
 if(op==='session_roster') valid=obj(v)&&obj(v.session)&&v.session.id===p.sessionId&&str(v.session.name)&&str(v.session.startsAt)&&str(v.session.endsAt)&&str(v.session.state)&&(v.session.instructor===null||str(v.session.instructor))&&str(v.timeZone)&&str(v.generatedAt)&&Array.isArray(v.members)&&v.members.length<=500&&v.members.every(m=>obj(m)&&id(m.id)&&str(m.name)&&str(m.rank)&&str(m.attendance));
 if(!valid) throw Error('HUB_RESPONSE_UNREADABLE');
 return response;
}

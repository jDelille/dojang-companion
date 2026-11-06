// Adapted by meaning from Companion workbench/{contractRules,useInvitationRun}.
// The current Hub accepts a broadcast audience, not a list of testing candidates.
import { migrationPayloadAllowed, migrationReadResultAllowed } from './companionMigration';
import { object, recordId } from './memberActions';

export type InvitationInputs = { goal:string; testId:string; audience:string; channel:string; purpose:string; body:string; reason:string };
export type TestingEvidence = { rows:{memberId:string;name:string;status:string;nextRank:{id:string;name:string}|null}[]; tests:{id:string;name:string;date:string;state:string;count:number}[] };
export type MessagingEvidence = { audiences:{id:string;label:string}[]; provider:string; quietHours:{start:number;end:number;timeZone:string} };
export type InvitationPreview = { audience:string;recipientCount:number;excludedCounts:Record<string,number>;sample:{name:string;address:string;students:number}[];excludedSample:{name:string;reason:string}[];provider:string;quietHoursStart:string|null;reviewToken:string };
export const recognizesInvitationGoal = (goal:string) => /invit/i.test(goal) && /test/i.test(goal) && goal.trim().length<=200;
export const invitationFingerprint = (i:InvitationInputs) => JSON.stringify([i.goal.trim(),i.testId,i.audience,i.channel,i.purpose,i.body.trim(),i.reason.trim()]);
export function testingEvidenceFrom(v:unknown):TestingEvidence|null {
 if(!migrationReadResultAllowed('testing_eligibility',{query:''},v)||!object(v))return null;
 const rows=v.rows as TestingEvidence['rows'],tests=v.tests as TestingEvidence['tests'];
 if(new Set(rows.map(r=>r.memberId)).size!==rows.length||new Set(tests.map(t=>t.id)).size!==tests.length)return null;
 return {rows,tests};
}
export function messagingEvidenceFrom(v:unknown):MessagingEvidence|null {
 if(!migrationReadResultAllowed('broadcast_context',{},v)||!object(v))return null;
 const audiences=v.audiences as MessagingEvidence['audiences'];
 if(new Set(audiences.map(a=>a.id)).size!==audiences.length)return null;
 return {audiences,provider:v.provider as string,quietHours:v.quietHours as MessagingEvidence['quietHours']};
}
export function invitationInputsAllowed(i:InvitationInputs,t:TestingEvidence,m:MessagingEvidence):boolean {
 return recognizesInvitationGoal(i.goal)&&recordId(i.testId)&&t.tests.some(test=>test.id===i.testId)&&m.audiences.some(a=>a.id===i.audience)
  &&i.reason.trim().length>0&&i.reason.length<=500&&migrationPayloadAllowed('create_broadcast',{channel:i.channel,purpose:i.purpose,audience:i.audience,body:i.body.trim(),name:i.goal.trim().slice(0,120),reason:i.reason.trim(),reviewToken:'a'.repeat(64)});
}
export function invitationCommand(i:InvitationInputs,t:TestingEvidence,m:MessagingEvidence,review:{fingerprint:string;preview:InvitationPreview},scopeConfirmed:boolean,effectsConfirmed:boolean):Record<string,unknown>|null {
 if(!scopeConfirmed||!effectsConfirmed||review.fingerprint!==invitationFingerprint(i)||!invitationInputsAllowed(i,t,m)
  ||!migrationReadResultAllowed('broadcast_preview',{},review.preview)||review.preview.recipientCount===0
  ||review.preview.audience!==m.audiences.find(a=>a.id===i.audience)?.label)return null;
 return {channel:i.channel,purpose:i.purpose,audience:i.audience,body:i.body.trim(),name:i.goal.trim().slice(0,120),reason:i.reason.trim(),reviewToken:review.preview.reviewToken};
}

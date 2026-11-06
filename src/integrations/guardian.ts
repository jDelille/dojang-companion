// Companion guardian integration, with receipt identity validation at both boundaries.
import type {CheckInCommand} from '@/domain/kiosk/checkInCommand';
import type {CheckInResult} from '@/contracts/kiosk-attendance';
export type GuardianVerified={guardianToken:string;expiresInSeconds:number;guardian:string;students:{memberId:string;displayName:string;onRoster:boolean;attendanceState:string|null}[]};
type Answer<T>={kind:'ok';value:T}|{kind:'problem';title:string;code:string}|{kind:'noAnswer'};
const obj=(v:unknown):v is Record<string,unknown>=>!!v&&typeof v==='object'&&!Array.isArray(v);
const id=(v:unknown)=>typeof v==='string'&&/^[1-9][0-9]{0,9}$/.test(v)&&Number(v)<=2147483647;
export function guardianVerifiedFrom(v:unknown):GuardianVerified|null {
 if(!obj(v)||typeof v.guardianToken!=='string'||!/^[A-Za-z0-9_-]{20,128}$/.test(v.guardianToken)||typeof v.guardian!=='string'||!Number.isSafeInteger(v.expiresInSeconds)||Number(v.expiresInSeconds)<1||Number(v.expiresInSeconds)>3600||!Array.isArray(v.students)||v.students.length>50)return null;
 if(!v.students.every(s=>obj(s)&&id(s.memberId)&&typeof s.displayName==='string'&&typeof s.onRoster==='boolean'&&(s.attendanceState===null||['pending','present','absent','excused'].includes(String(s.attendanceState))))||new Set(v.students.map(s=>s.memberId)).size!==v.students.length)return null;
 return v as GuardianVerified;
}
async function post<T>(path:string,body:unknown,accept:(v:unknown)=>T|null,signal:AbortSignal):Promise<Answer<T>>{
 try{const response=await fetch(path,{method:'POST',cache:'no-store',headers:{'content-type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.any([signal,AbortSignal.timeout(15000)])});const v:unknown=await response.json();
  if(response.ok){const value=accept(v);return value?{kind:'ok',value}:{kind:'noAnswer'};}
  if(obj(v)&&typeof v.code==='string'&&typeof v.title==='string')return {kind:'problem',code:v.code,title:v.title};
 }catch{}return {kind:'noAnswer'};
}
export const verifyGuardian=(phone:string,pin:string,sessionId:string,signal:AbortSignal)=>post('/api/v2/guardian/verify',{phone,pin,sessionId},guardianVerifiedFrom,signal);
export function guardianReceiptFrom(v:unknown,command:CheckInCommand):CheckInResult|null {
 if(!obj(v)||v.guardianVerified!==true||v.correlationId!==command.correlationId||typeof v.replayed!=='boolean'||!obj(v.receipt))return null;
 const r=v.receipt;
 if(!id(r.attendanceId)||r.memberId!==command.payload.memberId||r.sessionId!==command.payload.sessionId||!['present','late'].includes(String(r.status))||typeof r.alreadyRecorded!=='boolean'||typeof r.checkedInAt!=='string'||!Number.isFinite(Date.parse(r.checkedInAt))||typeof r.correlationId!=='string'||!/^[A-Za-z0-9][A-Za-z0-9_.:-]{15,127}$/.test(r.correlationId)||(!v.replayed&&r.correlationId!==command.correlationId))return null;
 return v as unknown as CheckInResult;
}
export const guardianCheckIn=(guardianToken:string,command:CheckInCommand,signal:AbortSignal)=>post('/api/v2/guardian/check-ins',{guardianToken,command},v=>guardianReceiptFrom(v,command),signal);

'use client';
// Dojang Companion GuardianCheckIn: private family list and per-child receipts.
import {useEffect,useRef,useState} from 'react';
import type {SessionOption} from '@/contracts/kiosk-attendance';
import type {CheckInCommand} from '@/domain/kiosk/checkInCommand';
import {guardianCheckIn,verifyGuardian,type GuardianVerified} from '@/integrations/guardian';
import styles from './guardianCheckIn.module.css';
import Avatar from './guardianAvatar';
type Result={text:string;retry?:CheckInCommand};
export default function GuardianCheckIn({session,onFinished,onCancel}:{session:SessionOption;onFinished:()=>void;onCancel:()=>void}){
 const [phone,setPhone]=useState(''),[pin,setPin]=useState(''),[verified,setVerified]=useState<GuardianVerified|null>(null);
 const [busy,setBusy]=useState(false),[message,setMessage]=useState(''),[results,setResults]=useState<Record<string,Result>>({}),[receipt,setReceipt]=useState(false);
 const alive=useRef(true),inFlight=useRef(false),abort=useRef(new AbortController());
 useEffect(()=>{alive.current=true;abort.current=new AbortController();return()=>{alive.current=false;abort.current.abort();};},[]);
 useEffect(()=>{if(!verified||receipt)return;const timer=setTimeout(()=>{setVerified(null);setResults({});setMessage('For privacy, the family list expired. Verify again or see staff.');},verified.expiresInSeconds*1000);return()=>clearTimeout(timer);},[verified,receipt]);
 useEffect(()=>{if(!receipt)return;const timer=setTimeout(onFinished,10000);return()=>clearTimeout(timer);},[receipt,onFinished]);
 async function verify(){
  if(inFlight.current)return;inFlight.current=true;setBusy(true);setMessage('');
  try{const answer=await verifyGuardian(phone,pin,session.sessionId,abort.current.signal);if(!alive.current)return;setPin('');
   if(answer.kind==='ok'){setVerified(answer.value);setPhone('');}else setMessage(answer.kind==='problem'?answer.title:'Verification could not be confirmed. Try again or see staff.');
  }finally{inFlight.current=false;if(alive.current)setBusy(false);}
 }
 async function check(memberId:string,existing?:CheckInCommand){
  if(!verified||inFlight.current)return;
  const student=verified.students.find(s=>s.memberId===memberId);if(!student?.onRoster||student.attendanceState!=='pending')return;
  const command=existing??{idempotencyKey:`guardian-${crypto.randomUUID()}`,correlationId:`guardian-${crypto.randomUUID()}`,payload:{memberId,sessionId:session.sessionId}};
  inFlight.current=true;setBusy(true);
  try{const answer=await guardianCheckIn(verified.guardianToken,command,abort.current.signal);if(!alive.current)return;
   const value:Result=answer.kind==='ok'?{text:answer.value.receipt.alreadyRecorded?'Already checked in.':`Attendance recorded${answer.value.receipt.status==='late'?' (late)':''}.`}:answer.kind==='problem'?{text:answer.title}:{text:'Attendance not confirmed. Retry the original request or see staff.',retry:command};
   setResults(old=>({...old,[memberId]:value}));
  }finally{inFlight.current=false;if(alive.current)setBusy(false);}
 }
 return <section className={styles.panel} aria-label={receipt?'Family check-in receipt':'Parent check-in'}>
  {receipt&&<><h2 className={styles.receiptTitle}>Check-in receipt</h2><p>{session.title}</p></>}
  {!verified?<><p>Enter the phone number the school has for you and your 6-digit kiosk PIN. Only your own children are shown.</p><form className={styles.fields} onSubmit={e=>{e.preventDefault();void verify();}}><label>Phone number<input inputMode="tel" autoComplete="off" value={phone} maxLength={32} disabled={busy} onChange={e=>setPhone(e.target.value)}/></label><label>Kiosk PIN<input type="password" inputMode="numeric" autoComplete="off" maxLength={6} value={pin} disabled={busy} onChange={e=>setPin(e.target.value.replace(/[^0-9]/g,''))}/></label><button disabled={busy||pin.length!==6||phone.replace(/[^0-9]/g,'').length<7}>Verify parent</button></form></>:<>
   {!receipt&&<p>Hello {verified.guardian}. Choose who is here for {session.title}.</p>}
   {verified.students.map(s=><div key={s.memberId} className={styles.student}><span className={styles.who}><Avatar name={s.displayName}/><strong>{s.displayName}</strong></span>{(results[s.memberId]||!s.onRoster||s.attendanceState!=='pending'||receipt)&&<span role="status">{results[s.memberId]?.text??(!s.onRoster?'Not booked in this class. Please see staff.':s.attendanceState!=='pending'?'Attendance already recorded.':receipt?'No check-in submitted.':'Ready for check-in.')}</span>}{!receipt&&s.onRoster&&s.attendanceState==='pending'&&(!results[s.memberId]||results[s.memberId].retry)&&<button disabled={busy} onClick={()=>void check(s.memberId,results[s.memberId]?.retry)}>{results[s.memberId]?.retry?'Retry original request':'Check in'}</button>}</div>)}
   {!verified.students.length&&<p>No children returned for this verified guardian. Please see staff.</p>}
  </>}
  {message&&<p role="alert">{message}</p>}
  <button disabled={busy} onClick={()=>{if(receipt)onFinished();else if(verified){setReceipt(true);setPhone('');setPin('');}else onCancel();}}>{verified?'Done':'Back'}</button>
 </section>;
}

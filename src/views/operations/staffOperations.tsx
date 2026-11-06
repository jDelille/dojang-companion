"use client";
import { useCallback, useEffect, useRef, useState } from 'react';
import { newRequestKey, explainHubError } from '@/domain/hubAction';
import { migrationPayloadAllowed, migrationResultAllowed, type ActionFeedback } from '@/domain/companionMigration';
import { object as obj } from '@/domain/memberActions';
import { getInboxContext, type InboxContextAnswer } from '@/integrations/hub';
import { MIGRATION_AUTH_LOST } from '@/integrations/companionMigration';
import { useStaffSessionReset } from '@/views/shell/staffSession';
import { useMarkSignedOut } from '@/views/shell/staffConnection';
import StaffSignIn from '@/views/shell/staffSignIn';
import { Tabs, ErrorBlock, LoadingBlock } from '@/templates/roster/components/ui/layout';
import Instructor from './InstructorWorkspace';
import Communications from './CommunicationsWorkspace';
import Setup from './SetupChecklist';
import Testing from './TestingWorkspace';
import Courses from './CourseAssignments';
import Attendance from './AttendanceWorkspace';
import Ai from './AiSettings';
import Reports from './OperationsWorkspace';
import Trials from './TrialsWorkspace';
import StudentIntakeLauncher from '@/views/people/studentIntakeLauncher';
import '@/templates/roster/roster.css';

type Command={operation:string;payload:Record<string,unknown>;key:string};
const sections=[['shifts','Instructor shifts'],['attendance','Attendance review'],['reports','Reports & print'],['courses','Course rosters'],['testing','School testing'],['communications','Messaging & automation'],['trials','Trial lifecycle'],['students','Student administration'],['setup','School setup'],['ai','AI configuration']];
export default function StaffOperations({enabled,initialSection="shifts"}:{enabled:boolean;initialSection?:string}) {
 const [answer,setAnswer]=useState<InboxContextAnswer|null>(null),[tab,setTab]=useState(initialSection),[busy,setBusy]=useState(false),[feedback,setFeedback]=useState<ActionFeedback>();
 const [adminOpen,setAdminOpen]=useState(false);
 const frozen=useRef<Command|null>(null),inFlight=useRef(false),alive=useRef(true);
 const reset=useStaffSessionReset(),markSignedOut=useMarkSignedOut();
 useEffect(()=>{alive.current=true;return()=>{alive.current=false;};},[]);
 const load=useCallback(()=>{void getInboxContext().then(next=>{if(alive.current)setAnswer(next);});},[]);
 useEffect(()=>{if(enabled)load();},[enabled,load]);
 useEffect(()=>{const lost=()=>{reset();markSignedOut();frozen.current=null;setFeedback(undefined);setBusy(false);setAdminOpen(false);setAnswer({outcome:'unavailable',code:'SIGN_IN_REQUIRED',text:'Sign in again.'});};window.addEventListener(MIGRATION_AUTH_LOST,lost);return()=>window.removeEventListener(MIGRATION_AUTH_LOST,lost);},[reset,markSignedOut]);
 const locked=busy||feedback?.kind==='uncertain'||adminOpen;
 useEffect(()=>{if(!locked)return;const warn=(e:BeforeUnloadEvent)=>e.preventDefault();const guard=(e:MouseEvent)=>{if(e.target instanceof Element&&e.target.closest('a[href]')&&!e.ctrlKey&&!e.metaKey){e.preventDefault();e.stopPropagation();}};window.addEventListener('beforeunload',warn);document.addEventListener('click',guard,true);return()=>{window.removeEventListener('beforeunload',warn);document.removeEventListener('click',guard,true);};},[locked]);
 async function execute(command:Command):Promise<ActionFeedback|undefined>{
  if(inFlight.current)return;
  if(!migrationPayloadAllowed(command.operation,command.payload)){const next:ActionFeedback={kind:'error',text:'This action does not match an approved contract.'};setFeedback(next);return next;}
  inFlight.current=true;frozen.current=command;setBusy(true);setFeedback(undefined);
  let next:ActionFeedback;
  try {const r=await fetch('/api/hub',{method:'POST',cache:'no-store',headers:{'content-type':'application/json'},body:JSON.stringify({operation:command.operation,payload:command.payload,requestKey:command.key}),signal:AbortSignal.timeout(45000)});const v:unknown=await r.json();
   if(r.ok&&migrationResultAllowed(command.operation,command.payload,v)&&obj(v)){const ids=Object.entries(v).filter(([key,value])=>key.endsWith('Id')&&typeof value==='string').map(([key,value])=>`${key}: ${value}`).join(' / ');next={kind:'success',text:`Odoo confirmed ${String(v.state??'saved').replaceAll('_',' ')}${ids?` / ${ids}`:''}.${v.messageSent===false?' This action did not confirm a delivered message.':''}`,testing:typeof v.testId==='string'?{testId:v.testId}:undefined};frozen.current=null;}
   else {const code=obj(v)&&obj(v.error)&&typeof v.error.code==='string'?v.error.code:null;if(code&&['SIGN_IN_REQUIRED','UNAUTHENTICATED'].includes(code))window.dispatchEvent(new Event(MIGRATION_AUTH_LOST));if(code&&!['CONCURRENT_RETRY','BACKEND_UNAVAILABLE','BACKEND_UNAVAILABLE_RETRY_SAME_ACTION'].includes(code)){next={kind:'error',text:`${explainHubError(code)} (${code})`};frozen.current=null;}else next={kind:'uncertain',text:'Result unknown. Check the original request; do not create a replacement.'};}
  } catch {next={kind:'uncertain',text:'Result unknown. Check the original request; do not create a replacement.'};}
  inFlight.current=false;if(alive.current){setBusy(false);setFeedback(next);}return next;
 }
 const act=(operation:string,payload:Record<string,unknown>)=>{if(locked||frozen.current)return Promise.resolve(undefined);return execute({operation,payload:structuredClone(payload),key:newRequestKey()});};
 const retry=()=>frozen.current?execute(frozen.current):Promise.resolve(undefined);
 if(!enabled)return <p>Staff Operations requires the real Odoo connection. No sample workflow writes are available.</p>;
 if(!answer)return <LoadingBlock label="Loading staff access..."/>;
 if(answer.outcome==='unavailable')return ['SIGN_IN_REQUIRED','UNAUTHENTICATED'].includes(answer.code??'')?<StaffSignIn onSignedIn={()=>{setAnswer(null);load();}}/>:<ErrorBlock message={answer.text} onRetry={load}/>;
 const data=answer.context,manager=['owner','manager'].includes(data.principal.role);
 if(!['owner','manager','instructor'].includes(data.principal.role))return <p>This workspace requires a staff grant.</p>;
 const activeTab=manager||['shifts','attendance','reports'].includes(tab)?tab:'shifts';
 const props={busy,locked:!!locked,feedback,clearFeedback:()=>{if(!locked)setFeedback(undefined);},act,retry};
 return <div className="crm-scope roster-scope"><header className="mb-5"><h1 className="text-xl font-bold">Staff Operations</h1><p className="mt-2 text-xs muted">Site #{data.principal.siteId} / {data.principal.role}. Each change is reviewed and committed by Odoo.</p></header>
  <div inert={!!locked}><Tabs label="Staff operations" active={activeTab} onChange={next=>{if(!locked){setTab(next);setFeedback(undefined);}}} tabs={sections.filter(([key])=>manager||['shifts','attendance','reports'].includes(key)).map(([key,label])=>({key,label}))}/></div>
  {feedback&&<div role={feedback.kind==='error'?'alert':'status'} className="my-4 rounded-xl border border-(--crm-line) p-4 text-sm"><p>{feedback.text}</p>{feedback.kind==='uncertain'&&<button type="button" disabled={busy} onClick={()=>void retry()} className="mt-3 underline">Check original action</button>}</div>}
  {activeTab==='shifts'&&<Instructor {...props}/>}{activeTab==='attendance'&&<Attendance {...props}/>}{activeTab==='reports'&&<Reports manager={manager} sessions={data.sessions.filter((s):s is typeof s & {startsAt:string}=>s.startsAt!==null)}/>}
  {manager&&<>{activeTab==='trials'&&<Trials {...props}/ >}{activeTab==='communications'&&<Communications members={data.members} {...props}/>}{activeTab==='students'&&<section className="my-4 space-y-4 rounded-xl border border-(--crm-line) p-5"><h2 className="font-semibold">Student intake and archives</h2><p className="text-xs muted">Reviewed profile intake and restore. No automatic membership, booking or outbound message.</p><StudentIntakeLauncher onOpenChange={setAdminOpen}/></section>}{activeTab==='setup'&&<Setup/>}{activeTab==='testing'&&<Testing {...props}/>}{activeTab==='courses'&&<Courses {...props}/>}{activeTab==='ai'&&<Ai {...props}/>}</>}
 </div>;
}

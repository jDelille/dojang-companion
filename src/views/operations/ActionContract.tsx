'use client';

// Companion's ActionContract/useInvitationRun, adapted to existing Dojang Hub
// authority and Roster controls. No provider sends or automatic write retries.
import {useEffect,useMemo,useRef,useState} from 'react';
import Link from 'next/link';
import {Button} from '@/templates/roster/components/ui/button';
import {Field,Input,Select,Textarea} from '@/templates/roster/components/ui/form';
import {workflowFetch} from '@/integrations/companionMigration';
import {DoForMeFocus} from '@/views/doForMe/doForMeProvider';
import type {CompanionContext} from '@/domain/companion';
import {explainHubError,type ActionFeedback} from '@/domain/companionMigration';
import {invitationCommand,invitationFingerprint,invitationInputsAllowed,messagingEvidenceFrom,recognizesInvitationGoal,testingEvidenceFrom,type InvitationInputs,type InvitationPreview,type MessagingEvidence,type TestingEvidence} from '@/domain/actionContract';
import styles from './actionContract.module.css';

type Phase='idle'|'loading'|'paused'|'editing'|'previewing'|'review'|'saving'|'error';
type Review={fingerprint:string;preview:InvitationPreview};
type Props={busy:boolean;locked:boolean;feedback?:ActionFeedback;clearFeedback:()=>void;act:(op:string,p:Record<string,unknown>)=>Promise<ActionFeedback|undefined>};
const initial:InvitationInputs={goal:'Invite testing candidates',testId:'',audience:'',channel:'sms',purpose:'service',body:'',reason:''};

async function read(operation:string,payload:Record<string,unknown>,signal:AbortSignal){
 const response=await workflowFetch('/api/hub',{method:'POST',cache:'no-store',headers:{'content-type':'application/json'},body:JSON.stringify({operation,payload,requestKey:null}),signal});
 const v=await response.json();
 if(!response.ok)throw Error(v.error?.code||'CONNECTION_UNAVAILABLE');
 return v;
}

export default function ActionContract({busy,locked,feedback,clearFeedback,act}:Props){
 const [inputs,setInputs]=useState<InvitationInputs>(initial),[phase,setPhase]=useState<Phase>('idle');
 const [evidence,setEvidence]=useState<{testing:TestingEvidence;messaging:MessagingEvidence}|null>(null);
 const [review,setReview]=useState<Review|null>(null),[error,setError]=useState('');
 const [scopeConfirmed,setScopeConfirmed]=useState(false),[effectsConfirmed,setEffectsConfirmed]=useState(false);
 const sequence=useRef(0),controller=useRef<AbortController|null>(null),sending=useRef(false),statusRef=useRef<HTMLDivElement>(null);
 useEffect(()=>()=>{++sequence.current;controller.current?.abort();},[]);
 const saved=phase==='saving'&&feedback?.kind==='success';
 const receipt=saved?feedback.broadcast:undefined;
 const reading=phase==='loading'||phase==='previewing';
 const disabled=locked||busy||reading||phase==='saving';
 const candidates=evidence?.testing.rows.filter(r=>r.status==='eligible')??[];
 const test=evidence?.testing.tests.find(t=>t.id===inputs.testId);
 const audience=evidence?.messaging.audiences.find(a=>a.id===inputs.audience);
 const payload=evidence&&review?invitationCommand(inputs,evidence.testing,evidence.messaging,review,scopeConfirmed,effectsConfirmed):null;
 const rail=useMemo<CompanionContext>(()=>({label:'Testing invitation contract',intelTitle:'Run evidence',intel:[{label:'Run',value:saved?'Saved for approval':phase},{label:'Testing context',value:test?.name??'Not selected'},{label:'Actual audience',value:audience?.label??'Not selected'},{label:'Preview',value:review?`${review.preview.recipientCount} contact recipients`:'Not prepared'}],guidance:'Review and approve the contract in the main workspace. Testing eligibility does not filter the selected broadcast audience. Delivery approval is separate.',suggestions:[],receipts:[],historyNotice:saved?`${feedback?.text??'Odoo confirmed this broadcast.'} Full broadcast history is in Messaging & automation; this receipt did not provide an actor or timestamp.`:'No Odoo save has been confirmed for this run. Preview and paused steps are not committed actions.'}),[saved,phase,test?.name,audience?.label,review,feedback?.text]);

 function edit<K extends keyof InvitationInputs>(key:K,value:InvitationInputs[K]){
  ++sequence.current;controller.current?.abort();clearFeedback();setReview(null);setScopeConfirmed(false);setEffectsConfirmed(false);setError('');
  setInputs(old=>({...old,[key]:value}));if(evidence)setPhase('editing');
 }
 async function load(){
  if(locked||busy||sending.current||!recognizesInvitationGoal(inputs.goal))return;
  const run=++sequence.current;controller.current?.abort();const abort=new AbortController();controller.current=abort;
  clearFeedback();setError('');setReview(null);setEvidence(null);setScopeConfirmed(false);setEffectsConfirmed(false);setPhase('loading');
  try{
   const [t,m]=await Promise.all([read('testing_eligibility',{query:''},abort.signal),read('broadcast_context',{},abort.signal)]);
   if(run!==sequence.current)return;
   const testing=testingEvidenceFrom(t),messaging=messagingEvidenceFrom(m);
   if(!testing||!messaging)throw Error('HUB_RESPONSE_UNREADABLE');
   setEvidence({testing,messaging});setPhase('editing');
  }catch(problem){if(run===sequence.current){setError(explainHubError((problem as Error).message));setPhase('error');}}
 }
 function pause(){++sequence.current;controller.current?.abort();setReview(null);setPhase('paused');}
 function stop(){if(locked||busy||sending.current)return;++sequence.current;controller.current?.abort();clearFeedback();setEvidence(null);setReview(null);setScopeConfirmed(false);setEffectsConfirmed(false);setError('');setPhase('idle');}
 async function preview(){
  if(disabled||!evidence||!invitationInputsAllowed(inputs,evidence.testing,evidence.messaging))return;
  const run=++sequence.current;const abort=new AbortController();controller.current=abort;
  const fingerprint=invitationFingerprint(inputs);setPhase('previewing');setReview(null);setError('');setScopeConfirmed(false);setEffectsConfirmed(false);
  try{
   const value:InvitationPreview=await read('broadcast_preview',{channel:inputs.channel,purpose:inputs.purpose,audience:inputs.audience,body:inputs.body.trim()},abort.signal);
   if(run!==sequence.current)return;
   setReview({fingerprint,preview:value});setPhase('review');statusRef.current?.focus();
  }catch(problem){if(run===sequence.current){setError(explainHubError((problem as Error).message));setPhase('editing');}}
 }
 async function save(){
  if(disabled||!payload||sending.current)return;
  sending.current=true;setPhase('saving');
  try{const result=await act('create_broadcast',payload);
   if(!result){setPhase('review');return;}
   if(result.kind==='error'){setReview(null);setScopeConfirmed(false);setEffectsConfirmed(false);setPhase('editing');}
  }finally{sending.current=false;}
 }

 return <section className={styles.workspace} aria-label="Action Contract">
  <DoForMeFocus focusKey="action-contract:testing-invitations" context={rail}/>
  <header><p className={styles.eyebrow}>Do For Me / Action Contract</p><h2>Prepare testing invitations</h2><p>Build a plan from Odoo evidence, inspect its scope, then explicitly save it for approval.</p></header>
  <Field label="Goal" hint="This first workflow supports testing invitations. It uses a defined workflow, not an autonomous AI decision."><Input value={inputs.goal} maxLength={200} disabled={disabled} onChange={e=>edit('goal',e.target.value)}/></Field>
  {!recognizesInvitationGoal(inputs.goal)&&<p role="status">This goal is not supported yet. Use a testing-invitation goal.</p>}
  <div className={styles.controls}>
   <Button type="button" disabled={disabled||!recognizesInvitationGoal(inputs.goal)} onClick={()=>void load()}>{phase==='paused'?'Resume and reload evidence':evidence?'Refresh evidence':'Build action contract'}</Button>
   {reading&&<Button type="button" disabled={locked||busy} onClick={pause}>Pause</Button>}
   {phase!=='idle'&&<Button type="button" disabled={locked||busy||phase==='saving'&&!saved} onClick={stop}>{saved?'Start a new run':'Stop run'}</Button>}
  </div>
  <div tabIndex={-1} ref={statusRef} className={styles.status} role="status">
   {saved?'Saved for approval. No messages sent by this action.':phase==='saving'?'Checking the authoritative save result. An unknown result must use the original request.':phase==='paused'?'Paused. No write was started. Resume reloads the evidence.':reading?'Reading scoped Odoo evidence...':phase==='review'?'Ready for scope and effects review.':phase==='editing'?'Evidence ready. Choose the actual broadcast audience and write the message.':phase==='error'?'Evidence unavailable. No contract was prepared.':'No run started.'}
  </div>
  {error&&<p role="alert">{error}</p>}
  <ol className={styles.steps} aria-label="Run steps">
   <li><strong>1. Inspect evidence</strong><span>{evidence?`${evidence.testing.rows.length} student rows and ${evidence.testing.tests.length} tests returned`:'Waiting for scoped reads'}</span></li>
   <li><strong>2. Review eligibility</strong><span>{evidence?`${candidates.length} attendance-eligible in the returned window; not full readiness`:'Waiting for evidence'}</span></li>
   <li><strong>3. Prepare audience and content</strong><span>{review?`${review.preview.recipientCount} contact recipients in the preview`:saved?'Saved': 'Staff input and native preview required'}</span></li>
   <li><strong>4. Save for approval</strong><span>{saved?'Odoo commit confirmed':phase==='saving'?'Awaiting authoritative result':'Explicit confirmation required'}</span></li>
  </ol>
  {evidence&&<>
   <details className={styles.panel}><summary>Inspect evidence and limits</summary><p>Eligibility is a bounded attendance check: up to 500 students and 50 tests. Evaluation gaps, belt inventory and full curriculum readiness are unavailable.</p><p>{evidence.messaging.provider==='not_configured'?'Messaging provider is not configured.':'A provider is configured but has not been proven by this read.'} Quiet hours: {evidence.messaging.quietHours.start}:00–{evidence.messaging.quietHours.end}:00 ({evidence.messaging.quietHours.timeZone}).</p>
    <ul>{candidates.slice(0,20).map(c=><li key={c.memberId}><Link href={`/people/${c.memberId}`}>{c.name}</Link>{c.nextRank?` / next rank: ${c.nextRank.name}`:''}</li>)}</ul>{candidates.length>20&&<p>Showing 20 of {candidates.length} returned eligible students.</p>}
   </details>
   <div className={styles.grid}>
    <div className={styles.panel}><h3>Scope and inputs</h3>
     <Field label="Testing event (context only)"><Select value={inputs.testId} disabled={disabled} onChange={e=>edit('testId',e.target.value)}><option value="">Choose an Odoo test</option>{evidence.testing.tests.map(t=><option key={t.id} value={t.id}>{t.name} / {t.date} / {t.state}</option>)}</Select></Field>
     <p>The event does not filter the broadcast recipients or register students.</p>
     <Field label="Actual broadcast audience"><Select value={inputs.audience} disabled={disabled} onChange={e=>edit('audience',e.target.value)}><option value="">Choose the exact audience</option>{evidence.messaging.audiences.map(a=><option key={a.id} value={a.id}>{a.label}</option>)}</Select></Field>
     <Field label="Channel"><Select value={inputs.channel} disabled={disabled} onChange={e=>edit('channel',e.target.value)}>{['sms','email','whatsapp'].map(c=><option key={c}>{c}</option>)}</Select></Field>
     <Field label="Purpose"><Select value={inputs.purpose} disabled={disabled} onChange={e=>edit('purpose',e.target.value)}><option value="service">Service</option><option value="marketing">Marketing</option></Select></Field>
     <Field label="Message"><Textarea value={inputs.body} maxLength={1500} disabled={disabled} onChange={e=>edit('body',e.target.value)}/></Field>
     <Field label="Reason"><Input value={inputs.reason} maxLength={500} disabled={disabled} onChange={e=>edit('reason',e.target.value)}/></Field>
     <Button type="button" disabled={disabled||!invitationInputsAllowed(inputs,evidence.testing,evidence.messaging)} onClick={()=>void preview()}>Preview exact audience</Button>
    </div>
    <div className={styles.panel}><h3>Action Contract</h3><dl><dt>Goal</dt><dd>{inputs.goal}</dd><dt>Testing context</dt><dd>{test?`${test.name} / ${test.date}`:'Not selected'}</dd><dt>Recipient scope</dt><dd>{audience?.label??'Not selected'}{review?` / ${review.preview.recipientCount} contact recipients`:''}</dd></dl>
     <h4>Will do</h4><p>Save one Odoo broadcast, containing the reviewed message and selected audience, awaiting separate delivery approval.</p>
     <h4>Will not do</h4><ul><li>Send, approve delivery or confirm delivery.</li><li>Restrict this audience to eligible students automatically.</li><li>Create registration links or instructor tasks.</li><li>Register students, promote ranks or change billing.</li></ul>
     <p>Approval to save this record is separate from approval to queue messages.</p>
    </div>
   </div>
  </>}
  {review&&!saved&&<section className={styles.panel} aria-label="Review invitation broadcast"><h3>Review native recipient preview</h3><p>{review.preview.audience}: {review.preview.recipientCount} contact recipients. Contacts can represent multiple students.</p><p className={styles.message}>{inputs.body}</p>
   <p>{review.preview.provider==='not_configured'?'Native preview: provider not configured.':'Native preview: provider configured, not exercised.'}{review.preview.quietHoursStart?` Delivery scheduling window starts ${new Date(review.preview.quietHoursStart).toLocaleString()}.`:''}</p>
   {review.preview.audience!==audience?.label&&<p role="alert">The audience label changed. Refresh evidence and preview again before saving.</p>}
   {Object.entries(review.preview.excludedCounts).map(([reason,count])=><p key={reason}>{count} excluded: {reason.replaceAll('_',' ')}</p>)}
   <details><summary>Recipient sample (not the complete audience)</summary><ul>{review.preview.sample.map((r,i)=><li key={i}>{r.name} / {r.address} / {r.students} linked student(s)</li>)}</ul>{review.preview.sample.length<review.preview.recipientCount&&<p>The sample does not identify every recipient.</p>}<ul>{review.preview.excludedSample.map((r,i)=><li key={i}>Excluded: {r.name} / {r.reason}</li>)}</ul></details>
   {review.preview.recipientCount===0&&<p role="alert">No recipients in this preview. Nothing can be saved from this run.</p>}
   <label className={styles.check}><input type="checkbox" checked={scopeConfirmed} disabled={disabled} onChange={e=>setScopeConfirmed(e.target.checked)}/>I reviewed the entire selected audience. It may include students outside this test or the eligible list.</label>
   <label className={styles.check}><input type="checkbox" checked={effectsConfirmed} disabled={disabled} onChange={e=>setEffectsConfirmed(e.target.checked)}/>I approve saving one broadcast for later approval, with the effects shown above.</label>
   <Button type="button" variant="primary" disabled={disabled||!payload} onClick={()=>void save()}>Approve preparation and save in Odoo</Button>
  </section>}
  {saved&&<section className={styles.panel} aria-label="Action Contract receipt"><h3>Odoo receipt</h3><p>{feedback?.text}</p>{receipt&&<p>Broadcast #{receipt.broadcastId} / {receipt.recipients} recipients saved / {receipt.excluded} excluded / Awaiting approval.</p>}<p>No registration, rank, billing or task action was included.</p><Link href="/operations?section=communications">Review broadcasts and delivery approval</Link></section>}
 </section>;
}

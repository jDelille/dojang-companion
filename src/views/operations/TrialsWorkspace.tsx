"use client";
import {useEffect,useState} from 'react';
import {workflowFetch} from '@/integrations/companionMigration';
import TrialPanel,{type TrialBinding} from './TrialPanel';
export default function TrialsWorkspace({busy,locked,...binding}:{busy:boolean;locked:boolean}&TrialBinding){
 const [leads,setLeads]=useState<{id:string;name:string}[]>([]),[leadId,setLeadId]=useState(''),[error,setError]=useState(''),[loaded,setLoaded]=useState(false);
 useEffect(()=>{let alive=true;void workflowFetch('/api/hub',{method:'POST',cache:'no-store',headers:{'content-type':'application/json'},body:JSON.stringify({operation:'crm_context',payload:{query:''},requestKey:null})}).then(async r=>{if(!r.ok)throw Error('Lead list unavailable.');return r.json();}).then(v=>{if(alive){setLeads(v.leads);setLoaded(true);}}).catch(()=>{if(alive)setError('Lead list unavailable. Reopen this tab to try again.');});return()=>{alive=false;};},[]);
 return <section><h2>Trial lifecycle</h2><p className="my-3 text-xs muted">Select an authorized CRM lead. This list may be capped by Odoo. Trial reservation, attendance and paid conversion are separate reviewed actions.</p>{error?<p role="alert">{error}</p>:!loaded?<p role="status">Loading leads...</p>:<><label>Lead<select className="ml-3 rounded border border-(--crm-line) bg-(--crm-panel) p-3" value={leadId} disabled={busy||locked} onChange={e=>{binding.clearFeedback();setLeadId(e.target.value);}}><option value="">Choose the exact lead</option>{leads.map(l=><option key={l.id} value={l.id}>{l.name} / #{l.id}</option>)}</select></label>{!leads.length&&<p>No leads returned by this read.</p>}{leadId&&<TrialPanel key={leadId} leadId={leadId} busy={busy} locked={locked} binding={binding}/>}</>}</section>;
}

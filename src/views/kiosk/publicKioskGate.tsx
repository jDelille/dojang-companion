'use client';
import {useEffect,useState,type ReactNode} from 'react';
import {signOutOfHub} from '@/integrations/hub';
import {clearWorkspaceTabs} from '@/views/shell/openTabs';
import {clearPerspective} from '@/views/shell/currentPerspective';
// Companion PublicModeGate, using current Hub logout rather than legacy staff pairing.
export default function PublicKioskGate({children}:{children:ReactNode}){
 const [state,setState]=useState<'clearing'|'ready'|'failed'>('clearing'),[attempt,setAttempt]=useState(0);
 useEffect(()=>{let alive=true;void signOutOfHub().then(ok=>{
  if(!alive)return;if(!ok){setState('failed');return;}
  clearWorkspaceTabs();clearPerspective();
  if(typeof BroadcastChannel!=='undefined'){const channel=new BroadcastChannel('dojang-public-mode');channel.postMessage('staff-cleared');channel.close();}
  try{localStorage.setItem('dojang:public-mode',String(Date.now()));}catch{setState('failed');return;}
  setState('ready');
 });return()=>{alive=false;};},[attempt]);
 if(state==='ready')return children;
 return <section className="my-auto space-y-4 py-8"><h1 className="text-2xl font-bold">{state==='failed'?'Kiosk privacy reset not confirmed':'Preparing the public kiosk'}</h1><p role="status">{state==='failed'?'Retry before handing this device to a visitor.':'Signing out staff and clearing private context...'}</p>{state==='failed'&&<button className="min-h-12 rounded-full border border-(--kiosk-line) px-5" onClick={()=>{setState('clearing');setAttempt(n=>n+1);}}>Retry privacy reset</button>}</section>;
}

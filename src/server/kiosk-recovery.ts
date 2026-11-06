import {createHmac} from 'node:crypto';
import {kioskAuthorized,kioskUnavailable,readKioskSessions,type KioskGatewayConfig} from './kiosk-gateway';
// Companion recovery key: bounded to this authorized pairing, never an Odoo key.
export async function recoveryContext(request:Request,c:KioskGatewayConfig,fetcher:typeof fetch=fetch){
 if(!kioskAuthorized(c,request.headers.get('cookie')??''))return kioskUnavailable(403);
 const probe=await readKioskSessions(request,c,fetcher);if(!probe.ok)return probe;
 const cookie=(request.headers.get('cookie')??'').split(';').map(s=>s.trim()).find(s=>s.startsWith('dojang_kiosk_test='))!.slice('dojang_kiosk_test='.length);
 const expiresAt=JSON.parse(Buffer.from(cookie.split('.')[0],'base64url').toString()).expiresAt;
 const binding=JSON.stringify([c.backend,c.origin,c.token,c.key,cookie]);
 const derive=(purpose:string)=>createHmac('sha256',c.secret).update(purpose+binding).digest('hex');
 return Response.json({scope:derive('queue-scope:'),key:derive('queue-encryption:'),expiresAt:Math.min(expiresAt,Date.now()+15*60*1000)},{headers:{'cache-control':'private, no-store',vary:'Cookie'}});
}

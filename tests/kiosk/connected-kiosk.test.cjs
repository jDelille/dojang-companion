require('./register-alias.cjs');
const {test}=require('node:test'),assert=require('node:assert/strict'),path=require('node:path');
const root=process.env.DOJANG_KIOSK_BUILD;
const {handle}=require(path.join(root,'server/kiosk-connected.js'));
const {kioskCookie}=require(path.join(root,'server/kiosk-gateway.js'));
const {recoveryContext}=require(path.join(root,'server/kiosk-recovery.js'));
const {guardianVerifiedFrom,guardianReceiptFrom}=require(path.join(root,'integrations/guardian.js'));
const c={origin:'http://localhost:3000',backend:'https://odoo.example',token:'t'.repeat(32),key:'g'.repeat(32),pairKey:'p'.repeat(32),secret:'s'.repeat(32)};
const command={idempotencyKey:'checkin-request-12345',correlationId:'checkin-correlation-12345',expectedVersion:5,payload:{memberId:'5',sessionId:'8'}};
const receipt={attendanceId:'9',memberId:'5',sessionId:'8',status:'present',checkedInAt:'2026-11-05T18:00:00Z',alreadyRecorded:false,correlationId:command.correlationId};
const req=(body,overrides={})=>new Request(c.origin+'/api/v2/test',{method:body?'POST':'GET',headers:{cookie:'dojang_kiosk_test='+kioskCookie(c),origin:c.origin,'content-type':'application/json',...overrides},...(body?{body:JSON.stringify(body)}:{})});
const reply=v=>async()=>Response.json({result:v});
test('unpaired kiosk cannot read roster or record attendance',async()=>{
 for(const op of ['roster','checkin','guardianVerify','guardianCheckin'])assert.equal((await handle(req(command,{cookie:''}),c,op,'8',()=>{throw Error('must not call backend');})).status,403);
});
test('roster is session scoped and strips unsupported private fields',async()=>{
 let sent;const row={memberId:'5',displayName:'Student',enrollmentStatus:'registered',attendanceState:'pending',email:'private'};
 const r=await handle(req(),c,'roster','8',async(url,init)=>{assert.equal(url,c.backend+'/kiosk/v2/session/roster');sent=JSON.parse(init.body);return Response.json({result:{roster:[row]}});});
 assert.deepEqual(sent.params,{token:c.token,sessionId:'8'});assert.equal(r.status,200);assert.equal((await r.json())[0].email,undefined);
 assert.equal((await handle(req(),c,'roster','8',reply({roster:[row,row]}))).status,503);
});
test('attendance forwards the exact original command and validates commit identity',async()=>{
 const r=await handle(req(command),c,'checkin',undefined,async(url,init)=>{assert.equal(url,c.backend+'/kiosk/v2/attendance/check-ins');assert.deepEqual(JSON.parse(init.body).params,{token:c.token,command});return Response.json({result:{receipt,replayed:false,correlationId:command.correlationId}});});
 assert.equal(r.status,201);assert.equal((await r.json()).receipt.attendanceId,'9');
 const replay=await handle(req(command),c,'checkin',undefined,reply({receipt,replayed:true,correlationId:command.correlationId}));assert.equal(replay.status,200);
});
test('scope overrides and foreign origins never reach the backend',async()=>{
 for(const bad of [{...command,role:'staff'},{...command,payload:{...command.payload,companyId:'9'}},{...command,expectedVersion:-1}])assert.equal((await handle(req(bad),c,'checkin',undefined,()=>{throw Error();})).status,400);
 assert.equal((await handle(req(command,{origin:'https://foreign.example'}),c,'checkin')).status,403);
});
test('network failure and mismatched receipts remain unknown, not committed or safely failed',async()=>{
 for(const fetcher of [async()=>{throw Error('offline');},reply({receipt:{...receipt,memberId:'99'},replayed:false,correlationId:command.correlationId}),reply({problem:{code:'UNKNOWN',status:500}})]){
  const r=await handle(req(command),c,'checkin',undefined,fetcher);assert.equal(r.status,503);assert.equal(await r.text(),'');
 }
});
test('known native refusals retain only the allowlisted reason',async()=>{
 const r=await handle(req(command),c,'checkin',undefined,reply({problem:{code:'SESSION_NOT_OPEN',status:409,detail:'secret traceback'}}));assert.equal(r.status,409);assert.equal((await r.json()).detail.includes('secret'),false);
});
test('guardian verification requires PIN/session scope and returns only validated family data',async()=>{
 const body={phone:'5551234567',pin:'123456',sessionId:'8'};const v={guardianToken:'a'.repeat(32),expiresInSeconds:300,guardian:'Parent',students:[{memberId:'5',displayName:'Child',onRoster:true,attendanceState:'pending',email:'private'}]};
 const r=await handle(req(body),c,'guardianVerify',undefined,reply(v));assert.equal(r.status,200);assert.equal((await r.json()).students[0].email,undefined);
 assert.equal((await handle(req({...body,memberId:'99'}),c,'guardianVerify')).status,400);
 assert.equal((await handle(req(body),c,'guardianVerify',undefined,reply({...v,students:[...v.students,...v.students]}))).status,503);
});
test('guardian receipt requires proof and the same student, session and request',async()=>{
 const value={guardianVerified:true,receipt,replayed:false,correlationId:command.correlationId};
 const r=await handle(req({guardianToken:'a'.repeat(32),command}),c,'guardianCheckin',undefined,reply(value));assert.equal(r.status,201);
 assert.ok(guardianReceiptFrom(value,command));assert.equal(guardianReceiptFrom({...value,receipt:{...receipt,sessionId:'99'}},command),null);assert.equal(guardianReceiptFrom({...value,guardianVerified:false},command),null);
 assert.equal(guardianVerifiedFrom({guardianToken:'x',students:[]}),null);
});
test('recovery material requires an authorized live pairing and never exposes backend credentials',async()=>{
 const sessionRead=reply({sessions:[]});const r=await recoveryContext(req(),c,sessionRead);assert.equal(r.status,200);const v=await r.json();assert.match(v.key,/^[a-f0-9]{64}$/);assert.notEqual(v.key,c.key);assert.notEqual(v.key,c.secret);assert.ok(v.expiresAt<=Date.now()+900000);
 assert.equal((await recoveryContext(req(undefined,{cookie:''}),c,sessionRead)).status,403);
 assert.equal((await recoveryContext(req(),c,async()=>{throw Error('offline');})).status,503);
});

require('./register-alias.cjs');
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {checkInFlowReducer:reduce,initialCheckInFlow}=require(process.env.DOJANG_FLOW_MODULE);
const {searchRoster,MIN_SEARCH_LETTERS}=require(process.env.DOJANG_ROSTER_SEARCH_MODULE);
const {getRoster}=require(process.env.DOJANG_KIOSK_CLIENT_MODULE);

// Fictional fixtures in the contract's shapes
const session={sessionId:'102',title:'Junior Taekwondo',startsAt:'2026-10-23T17:00:00.000Z',endsAt:'2026-10-23T18:00:00.000Z',version:3,capacity:8,seatsTaken:3};
const other={...session,sessionId:'103',title:'Adult Taekwondo'};
const student=(memberId,displayName)=>({memberId,displayName,enrollmentStatus:'registered',attendanceState:'pending'});
const roster=[student('2001','Ava M.'),student('2002','Ava N.'),student('2007','Ben A.')];
const run=(state,...actions)=>actions.reduce(reduce,state);
const listed={step:'session',sessions:{status:'ready',list:[session,other]}};
const identifying=()=>run(listed,{type:'selectSession',session});
const ready=()=>run(identifying(),{type:'rosterLoaded',sessionId:'102',roster});

test('picking a class opens identify with an empty search and the roster loading',()=>{assert.deepEqual(identifying(),{step:'identify',session,roster:{status:'loading'},query:''});assert.equal(run(initialCheckInFlow,{type:'selectSession',session}),initialCheckInFlow)});
test('a roster for a class already left is ignored',()=>{const state=run(identifying(),{type:'rosterLoaded',sessionId:'103',roster});assert.deepEqual(state.roster,{status:'loading'});assert.deepEqual(run(identifying(),{type:'rosterFailed',sessionId:'103'}).roster,{status:'loading'})});
test('roster loads, fails, and Try again reloads it',()=>{assert.deepEqual(ready().roster,{status:'ready',list:roster});const failed=run(identifying(),{type:'rosterFailed',sessionId:'102'});assert.deepEqual(failed.roster,{status:'unavailable'});assert.deepEqual(run(failed,{type:'retryRoster'}).roster,{status:'loading'});assert.equal(run(ready(),{type:'retryRoster'}).roster.status,'ready')});
test('search shows nobody under the minimum, then no match or matches by name start',()=>{assert.equal(MIN_SEARCH_LETTERS,2);assert.deepEqual(searchRoster(roster,''),{status:'tooShort'});assert.deepEqual(searchRoster(roster,' a '),{status:'tooShort'});assert.deepEqual(searchRoster(roster,'zz'),{status:'noMatch'});assert.deepEqual(searchRoster(roster,'va'),{status:'noMatch'});assert.deepEqual(searchRoster(roster,'av').matches.map(m=>m.memberId),['2001','2002']);assert.deepEqual(searchRoster(roster,'AVA m').matches.map(m=>m.memberId),['2001'])});
test('typing is kept in the flow state',()=>{assert.equal(run(ready(),{type:'searchChanged',query:'Av'}).query,'Av')});
test('only a student on the loaded roster can be picked',()=>{const picked=run(ready(),{type:'searchChanged',query:'Ava'},{type:'selectMember',member:roster[0]});assert.deepEqual(picked,{step:'confirm',session,member:roster[0],query:'Ava'});assert.equal(run(identifying(),{type:'selectMember',member:roster[0]}).step,'identify');assert.equal(run(ready(),{type:'selectMember',member:student('9999','Not Here')}).step,'identify')});
test('Back and Change class return to the class list without the search or roster',()=>{for(const type of ['back','changeSession']){const state=run(ready(),{type:'searchChanged',query:'Ava'},{type});assert.deepEqual(state,{step:'session',sessions:{status:'loading'},returningFrom:session})}});
test('Back from confirm returns to the same search with the student dropped',()=>{const state=run(ready(),{type:'searchChanged',query:'Ava'},{type:'selectMember',member:roster[0]},{type:'back'});assert.deepEqual(state,{step:'identify',session,roster:{status:'loading'},query:'Ava'})});
test('Start over clears class, search, roster and student',()=>{assert.equal(run(ready(),{type:'searchChanged',query:'Ava'},{type:'reset'}),initialCheckInFlow);assert.equal(run(ready(),{type:'selectMember',member:roster[0]},{type:'reset'}),initialCheckInFlow)});
test('getRoster asks for the selected class only, uncached and cancellable',async()=>{const original=globalThis.fetch;try{const calls=[];globalThis.fetch=async(url,init)=>{calls.push({url,init});return Response.json(roster)};const signal=new AbortController().signal;assert.deepEqual(await getRoster('102',signal),roster);assert.equal(calls[0].url,'/api/v2/sessions/102/roster');assert.equal(calls[0].init.cache,'no-store');assert.equal(calls[0].init.signal,signal);await getRoster('1/2');assert.equal(calls[1].url,'/api/v2/sessions/1%2F2/roster')}finally{globalThis.fetch=original}});
test('getRoster fails on an error response instead of returning a problem as a roster',async()=>{const original=globalThis.fetch;try{globalThis.fetch=async()=>Response.json({code:'SESSION_UNAVAILABLE'},{status:404});await assert.rejects(getRoster('999'),/Roster request failed \(404\)/)}finally{globalThis.fetch=original}});

require('./register-alias.cjs');
const {test,beforeEach}=require('node:test');
const assert=require('node:assert/strict');
const scenarioRoute=require(process.env.DOJANG_SCENARIO_ROUTE_MODULE);
const sessionsRoute=require(process.env.DOJANG_SESSIONS_ROUTE_MODULE);
const checkInsRoute=require(process.env.DOJANG_CHECK_INS_ROUTE_MODULE);
const {devKioskMock,kioskScenarios}=require(process.env.DOJANG_KIOSK_MOCK_MODULE);

// The routes share one mock on globalThis, like the dev server. Start each test with a fresh one.
beforeEach(()=>{delete globalThis.dojangKioskMock});

const put=scenario=>scenarioRoute.PUT(new Request('http://localhost/api/dev/kiosk-scenario',{method:'PUT',headers:{'content-type':'application/json'},body:JSON.stringify({scenario})}));
const sessions=()=>sessionsRoute.GET(new Request('http://localhost/api/v2/sessions'));
// Session 102 is version 3 and Ava M. (2001) is pending, so this check-in succeeds under "normal"
const command=(key='scenario-request-key-0001')=>({idempotencyKey:key,correlationId:'scenario-correlation-0001',expectedVersion:3,payload:{sessionId:'102',memberId:'2001'}});
const checkIn=body=>checkInsRoute.POST(new Request('http://localhost/api/v2/attendance/check-ins',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)}));
const avaState=()=>devKioskMock().roster(new Request('http://localhost'),'102').json().then(roster=>roster.find(member=>member.memberId==='2001').attendanceState);

test('GET shows the current scenario and the options, normal by default',async()=>{const r=scenarioRoute.GET();assert.equal(r.status,200);assert.deepEqual(await r.json(),{scenario:'normal',scenarios:[...kioskScenarios]})});
test('PUT switches to a known scenario and rejects unknown ones',async()=>{const bad=await put('explode');assert.equal(bad.status,400);assert.equal((await bad.json()).error,'Unknown scenario.');assert.equal(devKioskMock().scenario(),'normal');const good=await put('slow');assert.equal(good.status,200);assert.deepEqual(await good.json(),{scenario:'slow'});assert.equal(devKioskMock().scenario(),'slow')});
test('no-sessions makes the sessions route return an empty list',async()=>{await put('no-sessions');const r=await sessions();assert.equal(r.status,200);assert.deepEqual(await r.json(),[])});
test('forced-problem scenarios fail every check-in with their code and record nothing',async()=>{const forced={'not-on-roster':'NOT_ON_ROSTER','eligibility-review':'ELIGIBILITY_REVIEW_REQUIRED','session-not-open':'SESSION_NOT_OPEN','version-conflict':'VERSION_CONFLICT'};for(const [scenario,code] of Object.entries(forced)){await put(scenario);const r=await checkIn(command());assert.equal(r.headers.get('content-type'),'application/problem+json');const body=await r.json();assert.equal(body.code,code);assert.equal(body.correlationId,'scenario-correlation-0001');assert.match(body.detail,new RegExp(scenario))}assert.equal(await avaState(),'pending')});
test('network-failure saves the check-in but answers a bare 503; the same command replays it once normal',async()=>{await put('network-failure');const lost=await checkIn(command());assert.equal(lost.status,503);assert.equal(await lost.text(),'');assert.equal(await avaState(),'present');await put('normal');const retry=await checkIn(command());assert.equal(retry.status,200);assert.equal((await retry.json()).replayed,true)});
test('slow delays the routes by about 2.5 seconds',async()=>{await put('slow');const started=Date.now();const r=await sessions();assert.equal(r.status,200);assert.ok(Date.now()-started>=2400)});
test('DELETE resets check-ins to the seed data and keeps the scenario',async()=>{assert.equal((await checkIn(command())).status,201);await put('no-sessions');const r=scenarioRoute.DELETE();assert.equal(r.status,204);assert.equal(await avaState(),'pending');assert.equal(devKioskMock().scenario(),'no-sessions')});
test('in production the scenario route is 404 and the scenario is always normal',async()=>{const previous=process.env.NODE_ENV;process.env.NODE_ENV='production';try{assert.equal(scenarioRoute.GET().status,404);assert.equal((await put('network-failure')).status,404);assert.equal(scenarioRoute.DELETE().status,404);const mock=devKioskMock();assert.equal(mock.enabled,false);assert.equal(mock.scenario(),'normal');assert.throws(()=>mock.setScenario('slow'));const r=await sessions();assert.equal(r.status,503);assert.equal((await r.json()).code,'CAPABILITY_DISABLED')}finally{if(previous===undefined)delete process.env.NODE_ENV;else process.env.NODE_ENV=previous}});

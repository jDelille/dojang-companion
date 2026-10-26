require('./register-alias.cjs');
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {rosterTiles,ROSTER_GRID}=require(process.env.DOJANG_ROSTER_GRID_MODULE);
const {createKioskMock}=require(process.env.DOJANG_KIOSK_MOCK_MODULE);

// The dev mock's Junior Taekwondo roster (session 102), fictional
const roster102=async()=>createKioskMock({now:()=>new Date(2026,9,23,17,5),enabled:true}).roster(new Request('http://localhost/'),'102').json();
const names=tiles=>tiles.map(m=>m.displayName);

test('the grid is on unless the env flag says false',()=>{assert.equal(ROSTER_GRID,process.env.NEXT_PUBLIC_DOJANG_KIOSK_ROSTER_GRID!=='false')});
test('an empty filter lists the whole class A to Z, checked-in students included',async()=>{const roster=await roster102();const tiles=rosterTiles(roster,'');assert.equal(tiles.length,roster.length);assert.deepEqual(names(tiles),['Ava M.','Ava N.','Ben A.','Leo P.','Mia R.','Noah S.','Zoe T.']);assert.equal(tiles.find(m=>m.displayName==='Leo P.').attendanceState,'present');assert.deepEqual(rosterTiles(roster,'   '),tiles)});
test('typing narrows by name start, any case, from one letter',async()=>{const roster=await roster102();assert.deepEqual(names(rosterTiles(roster,'a')),['Ava M.','Ava N.']);assert.deepEqual(names(rosterTiles(roster,' AVA m')),['Ava M.']);assert.deepEqual(rosterTiles(roster,'va'),[]);assert.deepEqual(rosterTiles(roster,'zz'),[]);assert.deepEqual(rosterTiles([],''),[])});
test('the roster it was given is left as it was',async()=>{const roster=await roster102();const before=names(roster);rosterTiles(roster,'');assert.deepEqual(names(roster),before)});

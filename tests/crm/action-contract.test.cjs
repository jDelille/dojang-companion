const {test}=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const d=require(path.join(process.env.DOJANG_CRM_BUILD,'domain/actionContract.js'));
const inputs={goal:'Invite November testing candidates',testId:'8',audience:'template:7',channel:'sms',purpose:'service',body:'Please review the testing information.',reason:'Staff reviewed the selected course audience'};
const testing={rows:[{memberId:'5',name:'Student',status:'eligible',nextRank:null}],tests:[{id:'8',name:'November test',date:'2026-11-15',state:'draft',count:1}]};
const messaging={audiences:[{id:'template:7',label:'Advanced course'}],provider:'not_configured',quietHours:{start:21,end:8,timeZone:'America/Phoenix'}};
const preview={audience:'Advanced course',recipientCount:4,excludedCounts:{opted_out:1},sample:[{name:'Guardian',address:'5550100',students:2}],excludedSample:[],provider:'not_configured',quietHoursStart:null,reviewToken:'a'.repeat(64)};
const review={fingerprint:d.invitationFingerprint(inputs),preview};
test('contract produces only the existing create-broadcast payload, not sends or registrations',()=>{
 const command=d.invitationCommand(inputs,testing,messaging,review,true,true);
 assert.deepEqual(command,{channel:'sms',purpose:'service',audience:'template:7',body:inputs.body,name:inputs.goal,reason:inputs.reason,reviewToken:preview.reviewToken});
 assert.equal('testId' in command,false);assert.equal('memberIds' in command,false);
});
test('audience may differ from eligible counts only after both explicit confirmations',()=>{
 assert.equal(d.invitationCommand(inputs,testing,messaging,review,false,true),null);
 assert.equal(d.invitationCommand(inputs,testing,messaging,review,true,false),null);
 assert.ok(d.invitationCommand(inputs,testing,messaging,review,true,true));
});
for(const [key,value]of Object.entries({goal:'Invite December testing candidates',testId:'9',audience:'state:active',channel:'email',purpose:'marketing',body:'Changed content',reason:'Changed reason'})){
 test(`changing ${key} invalidates reviewed evidence`,()=>assert.equal(d.invitationCommand({...inputs,[key]:value},testing,messaging,review,true,true),null));
}
test('zero or malformed recipient previews never become commands',()=>{
 for(const patch of [{recipientCount:0},{recipientCount:-1},{recipientCount:'4'},{audience:'Different course'},{reviewToken:null},{sample:[{name:'x'}]}])assert.equal(d.invitationCommand(inputs,testing,messaging,{...review,preview:{...preview,...patch}},true,true),null);
});
test('only scoped returned test and audience choices are allowed',()=>{
 assert.equal(d.invitationInputsAllowed({...inputs,testId:'99'},testing,messaging),false);
 assert.equal(d.invitationInputsAllowed({...inputs,audience:'state:active'},testing,messaging),false);
 assert.equal(d.invitationInputsAllowed({...inputs,goal:'Refund all members'},testing,messaging),false);
 assert.equal(d.recognizesInvitationGoal('Invite testing candidates'),true);
});
test('testing evidence rejects duplicate identity and unavailable fields',()=>{
 const row={memberId:'5',name:'Student',currentRank:null,attended:12,threshold:10,status:'eligible',nextRank:null,openTest:null};
 const v={rows:[row],tests:testing.tests,ranks:[]};
 assert.ok(d.testingEvidenceFrom(v));assert.equal(d.testingEvidenceFrom({...v,rows:[row,row]}),null);
 assert.equal(d.testingEvidenceFrom({...v,rows:[{...row,attended:null}]}),null);
 assert.equal(d.testingEvidenceFrom({...v,tests:[...testing.tests,...testing.tests]}),null);
});
test('messaging evidence rejects duplicate audiences and missing provider facts',()=>{
 const v={...messaging,broadcasts:[]};assert.ok(d.messagingEvidenceFrom(v));
 assert.equal(d.messagingEvidenceFrom({...v,audiences:[...v.audiences,...v.audiences]}),null);
 assert.equal(d.messagingEvidenceFrom({...v,provider:null}),null);
});

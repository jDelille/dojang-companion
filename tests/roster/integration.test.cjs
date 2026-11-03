const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const crypto = require('node:crypto');
const Module = require('node:module');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const build = process.env.DOJANG_ROSTER_BUILD;
let crmAnswer;
let queries = [];
let companionFocus;
const resolve = Module._resolveFilename;
Module._resolveFilename = function(request, ...rest) {
  if (request.startsWith('@/')) request = path.join(build, request.slice(2));
  if (request === 'react' || request === 'react/jsx-runtime' || request === 'lucide-react') request = path.join(process.cwd(), 'node_modules', request);
  return resolve.call(this, request, ...rest);
};
const load = Module._load;
Module._load = function(request, ...rest) {
  if (request.endsWith('.css')) return {};
  if (request === 'next/navigation') return { useRouter: () => ({ refresh() {} }), usePathname: () => '/crm', redirect: (href) => { throw new Error(`REDIRECT:${href}`); } };
  if (request === 'next/link') return { __esModule: true, default: ({ children, ...props }) => React.createElement('a', props, children) };
  if (request === '@/integrations/crm') return { getCrmContext: async (query) => { queries.push(query); return crmAnswer; }, USES_SAMPLE_LEADS: false };
  if (request === '@/integrations/companion') return { getCompanionContext: async (focus) => { companionFocus = focus; return null; } };
  if (request === '@/server/hub-gateway') return { hubEnabled: () => true };
  if (request === '@/views/doForMe/doForMeProvider') return { DoForMeFocus: () => null };
  if (request === '@/views/shell/staffSession') return { useStaffSessionReset: () => () => {} };
  if (request === '@/views/shell/staffConnection') return { useMarkSignedOut: () => () => {} };
  if (request === '@/views/shell/hubUnavailable') return {
    __esModule: true,
    default: ({ code }) => React.createElement('p', { role: 'alert' }, code),
    HubSignOutButton: () => React.createElement('button', {}, 'Sign out'),
  };
  return load.call(this, request, ...rest);
};
const { toRosterPipeline } = require(path.join(build, 'templates/roster/adapters/pipeline.js'));
const { PipelineBoard } = require(path.join(build, 'templates/roster/components/pipeline/kanban.js'));
const { Modal } = require(path.join(build, 'templates/roster/components/ui/overlay.js'));
const { isDojangPage } = require(path.join(build, 'config/dojang.js'));
const { default: RosterPage } = require(path.join(build, 'app/(main)/roster/page.js'));
const { default: CrmPage } = require(path.join(build, 'app/(main)/crm/page.js'));
const { LeadList, LostLeads } = require(path.join(build, 'views/crm/leadViews.js'));
const { organizeLeads } = require(path.join(build, 'domain/leadOrganization.js'));
const { default: SalesPipeline } = require(path.join(build, 'views/crm/salesPipeline.js'));
const lead = (id, stageId = '1') => ({ id, name: `Student ${id}`, contact: 'Guardian', version: 123, stageId, stage: 'Intake', ownerId: '7', owner: 'Staff Owner', source: 'Website', email: '', phone: '', tags: [] });
const context = (leads = [], moreLeads = false) => ({ stages: [{ id: '1', name: 'Intake' }], leads, moreLeads, assignees: [], followUps: { outcome: 'notSent' } });

test('the display adapter preserves identity, stage order and partial status without manufacturing deal facts', () => {
  const input = context([lead('42')], true);
  const before = structuredClone(input);
  const result = toRosterPipeline(input);
  assert.deepEqual(input, before);
  assert.equal(result.partial, true);
  assert.equal(result.deals[0].href, '/crm/leads/42');
  assert.equal(result.deals[0].owner, 'Staff Owner');
  for (const key of ['value', 'currency', 'createdAt']) assert.equal(result.deals[0][key], undefined);
  assert.deepEqual(result.stages, [{ id: '1', name: 'Intake', color: null }]);
});
test('missing stages and unstaged leads remain visible without guessing a business stage', () => {
  const result = toRosterPipeline(context([lead('42', null), lead('43', '99')]));
  assert.equal(result.deals.length, 2);
  for (const deal of result.deals) assert.ok(result.stages.some(stage => stage.id === deal.stageId));
  assert.equal(result.stages.find(stage => stage.id === 'display:no-stage').name, 'No stage assigned');
  // Made-up groups are marked so the board never accepts a drop into them
  assert.deepEqual(result.stages.filter(stage => stage.display).map(stage => stage.id), ['display:no-stage', '99']);
  const html = renderToStaticMarkup(React.createElement(PipelineBoard, { data: result, showHeader: false }));
  assert.match(html, /<option value="display:no-stage" disabled=""/);
});
test('the actual migrated component renders Hub leads, capped count qualifications and disabled writes', () => {
  const html = renderToStaticMarkup(React.createElement(PipelineBoard, { data: toRosterPipeline(context([lead('42')], true)) }));
  assert.match(html, /Roster pipeline/);
  assert.match(html, /Student 42/);
  assert.match(html, /At least 1 lead in this read/);
  assert.match(html, /Staff Owner/);
  // Cards drag on the board only; nothing says a move is saved to Odoo
  assert.match(html, /draggable="true"/);
  assert.match(html, /Move Student 42 on this board \(not saved to Odoo\)/);
  assert.match(html, /<button[^>]+disabled[^>]*>.*?New lead/s);
  assert.doesNotMatch(html, /\$0|0\.00|just now|Not saved<|Reset board/);
});
test('the imported modal has an accessible title and close control', () => {
  const html = renderToStaticMarkup(React.createElement(Modal, { open: true, onClose() {}, title: 'Lead preview', children: 'Internal context' }));
  assert.match(html, /role="dialog"/);
  const titleId = /aria-labelledby="([^"]+)"/.exec(html)[1];
  assert.ok(html.includes(`id="${titleId}"`));
  assert.match(html, /aria-label="Close dialog"/);
});
test('authentication, permission and network errors render the shared failure state, never a sample board', async () => {
  for (const code of ['SIGN_IN_REQUIRED', 'UNAUTHENTICATED', 'FORBIDDEN', 'BACKEND_UNAVAILABLE', 'HUB_RESPONSE_UNREADABLE']) {
    crmAnswer = { outcome: 'unavailable', code, text: code };
    const html = renderToStaticMarkup(await CrmPage({ searchParams: Promise.resolve({}) }));
    assert.ok(html.includes(code));
    assert.doesNotMatch(html, /Recorded stage for|Sample Student|No pipeline stages/);
  }
});
test('the successful route renders authoritative CRM data through the same board', async () => {
  crmAnswer = { outcome: 'loaded', context: context([lead('42')]) };
  const html = renderToStaticMarkup(await CrmPage({ searchParams: Promise.resolve({}) }));
  assert.match(html, /Student 42/);
  assert.match(html, /1 lead across 1 stage · from Odoo/);
  assert.match(html, /Move Student 42 on this board/);
  // The lead details panel is off by default, behind the header switch
  assert.match(html, /role="switch" [^>]*aria-checked="false"/);
  assert.doesNotMatch(html, /aria-label="Selected lead"/);
  // The toolbar is hidden for now (SHOW_TOOLBAR in salesPipeline.tsx)
  assert.doesNotMatch(html, /Search lead or contact name|Overdue tasks|All owners|aria-label="Pipeline view"|Sign out/);
  assert.deepEqual(companionFocus, { kind: 'sales' });
  assert.equal(isDojangPage('/roster'), true);
  assert.equal(isDojangPage('/roster/preview'), true);
  assert.equal(isDojangPage('/roster-other'), false);
});

test('server search preserves the existing CRM query and error recovery link', async () => {
  queries = [];
  crmAnswer = { outcome: 'loaded', context: context([lead('42')]) };
  const html = renderToStaticMarkup(await CrmPage({ searchParams: Promise.resolve({ q: ' Guardian ' }) }));
  assert.deepEqual(queries, ['Guardian']);
  crmAnswer = { outcome: 'unavailable', code: 'FORBIDDEN', text: 'No access' };
  assert.match(renderToStaticMarkup(await CrmPage({ searchParams: Promise.resolve({ q: 'Guardian' }) })), /Clear search and return to pipeline/);
});

test('the controlled Roster board shares selection with the Sales tray', () => {
  const record = { ...lead('42'), tags: [{ id: '7', name: 'Karate' }], evidence: { priority: 'High', nextAction: 'follow_up', priorityReason: 'Recorded reason', openTasks: 1, overdueTasks: 1, dueToday: 0, journey: 'Contacted', trialLinked: false, memberLinked: false } };
  const html = renderToStaticMarkup(React.createElement(PipelineBoard, { data: toRosterPipeline(context([record])), showHeader: false, selection: { id: '42', onSelect() {} } }));
  assert.match(html, /aria-current="true"/);
  assert.match(html, /Student 42/);
  assert.doesNotMatch(html, /role="dialog"|Roster pipeline/);
});

test('filtering and sorting feed the migrated board without losing lead identities', () => {
  const record = { ...lead('42'), tags: [{ id: '7', name: 'Karate' }], evidence: { priority: 'High', nextAction: 'follow_up', priorityReason: 'Recorded reason', openTasks: 1, overdueTasks: 1, dueToday: 0, journey: 'Contacted', trialLinked: false, memberLinked: false } };
  const input = [lead('43'), record];
  const filtered = organizeLeads(input, { owner: 'Staff Owner', tag: '7', stage: '1', source: 'Website', attention: 'overdue', sort: 'priority' });
  assert.deepEqual(filtered.map(lead => lead.id), ['42']);
  const html = renderToStaticMarkup(React.createElement(PipelineBoard, { data: toRosterPipeline(context(filtered)), showHeader: false }));
  assert.match(html, /Student 42/);
  assert.doesNotMatch(html, /Student 43/);
  assert.deepEqual(input.map(lead => lead.id), ['43', '42']);
});

test('list view and fixture-only lost outcomes retain their record identities and selection', () => {
  const html = renderToStaticMarkup(React.createElement(LeadList, { leads: [lead('42')], selectedId: '42', onSelect() {} }));
  assert.match(html, /<table/);
  assert.match(html, /Student 42/);
  assert.match(html, /aria-pressed="true"/);
  const lost = renderToStaticMarkup(React.createElement(LostLeads, { leads: [{ ...lead('43'), lostReason: 'Timing' }], selectedId: null, onSelect() {} }));
  assert.match(lost, /Lost/);
  assert.match(lost, /Timing/);
});

test('fixture Sales keeps the sample banner and separates lost leads from the Roster board', () => {
  const html = renderToStaticMarkup(React.createElement(SalesPipeline, {
    context: context([lead('42'), { ...lead('43'), lostReason: 'Timing' }]),
    showsSampleData: true, fromOdoo: false,
  }));
  assert.match(html, /Sample leads/);
  // Sample data never creates leads
  assert.match(html, /<button[^>]*disabled=""[^>]*title="New leads can only be created when connected to Odoo"|<button[^>]*title="New leads can only be created when connected to Odoo"[^>]*disabled=""/);
  assert.match(html, /1 lost/);
  assert.match(html, /aria-label="Lost leads"/);
  assert.equal((html.match(/Student 43/g) || []).length, 1);
  assert.doesNotMatch(html, /Leads from Odoo|Lost leads are archived/);
});

test('real Sales qualifies capped results and does not manufacture a Lost list or missing evidence counts', () => {
  const html = renderToStaticMarkup(React.createElement(SalesPipeline, {
    context: context([lead('42')], true), showsSampleData: false, fromOdoo: true,
  }));
  assert.match(html, /This read is capped/);
  assert.match(html, />New lead</);
  assert.doesNotMatch(html, /New leads can only be created when connected to Odoo/);
  assert.match(html, /At least 1 lead across 1 stage/);
  assert.match(html, /Lost leads are archived/);
  assert.doesNotMatch(html, /aria-label="Lost leads"|Sample leads|0 open tasks/);
});

test('old Roster bookmarks redirect to the canonical Sales route while preserving search', async () => {
  await assert.rejects(RosterPage({ searchParams: Promise.resolve({}) }), /REDIRECT:\/crm$/);
  await assert.rejects(RosterPage({ searchParams: Promise.resolve({ q: ' Guardian & student ' }) }), /REDIRECT:\/crm\?q=Guardian\+%26\+student$/);
});
test('all imported references match their recorded hashes and contain only the selected source types', () => {
  const directory = path.join(process.cwd(), 'vendor/licensed/roster/source');
  const manifest = JSON.parse(fs.readFileSync(path.join(directory, 'SOURCE-MANIFEST.json')));
  assert.ok(manifest.files.length >= 100);
  for (const file of manifest.files) {
    assert.doesNotMatch(file.path, /(^|\/)(node_modules|\.next|\.git|\.env[^/]*)(\/|$)/);
    assert.doesNotMatch(file.path, /^(app\/api|lib\/(auth|db)|workers)\//);
    assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(directory, file.path))).digest('hex'), file.sha256, file.path);
  }
});
test('active source contains no vendor API, provider send, auth or database dependency', () => {
  const directory = path.join(process.cwd(), 'src/templates/roster');
  for (const file of fs.readdirSync(directory, { recursive: true }).filter(file => /\.tsx?$/.test(file))) {
    const source = fs.readFileSync(path.join(directory, file), 'utf8');
    assert.doesNotMatch(source, /fetch\(|\/api\/pipeline|next-auth|@prisma|from ['"](?:twilio|bullmq|ioredis|openai)['"]/, file);
  }
});

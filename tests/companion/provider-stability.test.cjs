const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const Module = require('node:module');
const build = process.env.DOJANG_COMPANION_BUILD;
const target = path.join(build, 'views/doForMe/doForMeProvider.js');
const resolve = Module._resolveFilename;
Module._resolveFilename = function (request, ...rest) {
  if (request.startsWith('@/')) request = path.join(build, request.slice(2));
  return resolve.call(this, request, ...rest);
};

// Small hook host for the real provider: checks context identity across state
// transitions without a browser or an additional renderer dependency.
let slots = [], cursor = 0, effects = [], changes = 0;
const sameDeps = (a, b) => a && b && a.length === b.length && a.every((v, i) => Object.is(v, b[i]));
const hooks = {
  createContext: value => ({ value, Provider: Symbol('provider') }),
  useContext: context => context.value,
  useState(initial) {
    const index = cursor++;
    if (!slots[index]) {
      const slot = { value: initial };
      slot.set = next => {
        const value = typeof next === 'function' ? next(slot.value) : next;
        if (!Object.is(value, slot.value)) { changes++; slot.value = value; }
      };
      slots[index] = slot;
    }
    return [slots[index].value, slots[index].set];
  },
  useRef(initial) { const index = cursor++; return slots[index] ?? (slots[index] = { current: initial }); },
  useMemo(factory, deps) {
    const index = cursor++;
    if (!slots[index] || !sameDeps(slots[index].deps, deps)) slots[index] = { value: factory(), deps };
    return slots[index].value;
  },
  useCallback(fn, deps) { return hooks.useMemo(() => fn, deps); },
  useLayoutEffect(fn, deps) {
    const index = cursor++;
    if (!slots[index] || !sameDeps(slots[index].deps, deps)) { slots[index] = { deps }; effects.push(fn); }
  },
};
const load = Module._load;
Module._load = function (request, parent, ...rest) {
  if (parent?.filename === target) {
    if (request === 'react') return hooks;
    if (request === 'react/jsx-runtime') return { jsx: (type, props) => ({ type, props }) };
    if (request === './doForMeRail') return { default: () => null };
    if (request === './revealCompanion') return { revealCompanion: () => {} };
  }
  return load.call(this, request, parent, ...rest);
};
const { DoForMeProvider, useDoForMe } = require(target);
function render() {
  cursor = 0; effects = [];
  const root = DoForMeProvider({ children: null });
  effects.forEach(fn => fn());
  const actions = root.props.children;
  const view = actions.props.children;
  return { setFocus: root.props.value, actions: actions.props.value, view: view.props.value };
}
test.beforeEach(() => { slots = []; cursor = 0; effects = []; changes = 0; });

test('publishing fresh record context never changes action context or recurses through its consumers', () => {
  const first = render();
  for (let i = 0; i < 30; i++) {
    first.setFocus({ key: 'message:301', context: { label: `Updated ${i}`, suggestions: [], intel: [], history: [] } });
    const next = render();
    assert.equal(next.actions, first.actions);
    assert.equal(next.actions.aim, first.actions.aim);
    assert.equal(next.view.focus.context.label, `Updated ${i}`);
  }
});

test('stable aim reads the latest focus; selections still notify consumers and reset clears them', () => {
  const initial = render();
  const suggestion = { id: 'follow-up', actionLabel: 'Review', review: 'page' };
  initial.setFocus({ key: 'lead:9', context: { suggestions: [suggestion] } });
  render();
  initial.actions.aim('lead:9');
  const picked = render();
  assert.equal(picked.actions.pickedFor('lead:9'), suggestion);
  assert.equal(picked.view.current.tab, 'evidence');
  assert.notEqual(picked.actions, initial.actions);
  picked.actions.settle('lead:9', 'plan');
  const settled = render();
  assert.equal(settled.actions.pickedFor('lead:9'), null);
  const before = changes;
  settled.actions.settle('lead:9', 'plan');
  assert.equal(changes, before, 'settling the same state is a no-op');
  settled.actions.reset();
  const reset = render();
  assert.equal(reset.view.focus, null);
  assert.equal(reset.actions.pickedFor('lead:9'), null);
});

test('the outside-provider actions object is stable', () => {
  assert.equal(useDoForMe(), useDoForMe());
});

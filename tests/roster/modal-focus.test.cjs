const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const Module = require('node:module');
const build = process.env.DOJANG_ROSTER_BUILD;
const target = path.join(build, 'templates/roster/components/ui/overlay.js');
const resolve = Module._resolveFilename;
Module._resolveFilename = function (request, ...rest) {
  if (request.startsWith('@/')) request = path.join(build, request.slice(2));
  if (request === 'react/jsx-runtime') request = path.join(process.cwd(), 'node_modules/react/jsx-runtime');
  if (request === 'react' || request === 'lucide-react') request = path.join(process.cwd(), 'node_modules', request);
  return resolve.call(this, request, ...rest);
};
let slots = [], cursor = 0, pending = [];
const same = (a, b) => a && b && a.length === b.length && a.every((v, i) => Object.is(v, b[i]));
const effect = (fn, deps) => {
  const index = cursor++;
  if (!slots[index] || !same(slots[index].deps, deps)) {
    pending.push(() => { slots[index]?.cleanup?.(); slots[index] = { deps, cleanup: fn() }; });
  }
};
const hooks = {
  useRef(value) { const index = cursor++; return slots[index] ?? (slots[index] = { current: value }); },
  useId() { cursor++; return 'modal-test'; },
  useCallback(fn, deps) { const index = cursor++; if (!slots[index] || !same(slots[index].deps, deps)) slots[index] = { deps, fn }; return slots[index].fn; },
  useLayoutEffect: effect, useEffect: effect,
};
const load = Module._load;
Module._load = function (request, parent, ...rest) {
  if (request === 'react' && parent?.filename === target) return hooks;
  return load.call(this, request, parent, ...rest);
};
const { Modal } = require(target);

test('typing rerenders keep the current field focused; Escape, Tab and close restoration remain functional', () => {
  let firstFocus = 0, restored = 0, closed = 0;
  const listeners = new Map(), timers = new Map();
  const trigger = { focus: () => { restored++; } };
  const first = { offsetParent: {}, focus: () => { firstFocus++; document.activeElement = first; } };
  const email = { offsetParent: {}, focus: () => { document.activeElement = email; } };
  const panel = { querySelector: () => first, querySelectorAll: () => [first, email], contains: node => node === first || node === email };
  global.document = { activeElement: trigger, body: { style: { overflow: 'auto', paddingRight: '' } }, documentElement: { clientWidth: 1000 },
    addEventListener: (name, fn) => listeners.set(name, fn), removeEventListener: name => listeners.delete(name) };
  global.window = { innerWidth: 1000, setTimeout: fn => { timers.set(1, fn); return 1; }, clearTimeout: id => timers.delete(id) };
  function attach(node) {
    if (!node || typeof node !== 'object') return;
    if (node.props?.role === 'dialog') node.props.ref.current = panel;
    for (const child of [node.props?.children].flat(Infinity)) attach(child);
  }
  function render(open, onClose) {
    cursor = 0; pending = [];
    attach(Modal({ open, onClose, title: 'Edit lead', children: 'fields' }));
    pending.forEach(fn => fn());
    for (const fn of timers.values()) fn();
    timers.clear();
  }
  try {
    render(true, () => { closed += 100; });
    assert.equal(firstFocus, 1);
    email.focus();
    for (let letter = 0; letter < 10; letter++) render(true, () => { closed++; });
    assert.equal(document.activeElement, email);
    assert.equal(firstFocus, 1, 'rerender must not repeat initial focus');
    assert.equal(restored, 0, 'typing must not run dialog cleanup');
    listeners.get('keydown')({ key: 'Escape', stopPropagation() {} });
    assert.equal(closed, 1, 'Escape must use the latest close callback');
    let prevented = false;
    listeners.get('keydown')({ key: 'Tab', shiftKey: false, preventDefault() { prevented = true; } });
    assert.equal(prevented, true);
    assert.equal(document.activeElement, first);
    render(false, () => {});
    assert.equal(restored, 1);
    assert.equal(document.body.style.overflow, 'auto');
    assert.equal(listeners.size, 0);
  } finally { delete global.document; delete global.window; }
});

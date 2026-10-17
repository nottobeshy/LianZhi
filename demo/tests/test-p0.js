'use strict';
// Node 隔离回归：运行实际入口/事件/视图，DOM、时钟和 localStorage 用内存替身。
// 不访问浏览器用户数据，不代替真实浏览器交互/布局测试；可从任意目录执行。
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const demo = path.resolve(__dirname, '..');
const key = 'kc.vocabs.v1';
const user = { id: 'user_keep', name: '保留库', builtin: false, terms: [
  { id: 'u1', title: '词一', level: '入门', enabled: true },
  { id: 'u2', title: '词二', level: '基础', enabled: false }
] };
const rawUser = () => JSON.stringify({ activeVocabId: user.id, vocabs: [user] });

function boot(raw = null, globals = {}) {
  let clock = 1000, seq = 0, html = '';
  const tasks = new Map(), nodes = new Map(), listeners = {};
  const storage = { data: { [key]: raw }, writes: 0, failWrite: false, failRead: false,
    getItem(k) { if (this.failRead) throw Error('SecurityError'); return this.data[k] ?? null; },
    setItem(k, v) { if (this.failWrite) throw Error('QuotaExceededError'); this.writes++; this.data[k] = String(v); }
  };
  const element = () => ({ id: '', dataset: {}, style: {}, disabled: false, textContent: '', value: '', isConnected: true,
    classList: { add() {}, remove() {} }, querySelector() { return null; }, addEventListener(type,fn) { (this.events ||= {})[type]=fn; }, setAttribute() {}, select() {}, click() {}, remove() {} });
  const decode = s => s.replace(/&(amp|lt|gt|quot|#39);/g, (_, c) => ({ amp: '&', lt: '<', gt: '>', quot: '"', '#39': "'" })[c]);
  const app = element();
  Object.defineProperty(app, 'innerHTML', { get() { return html; }, set(v) {
    html = v; nodes.clear();
    for (const m of v.matchAll(/<(\w+)\b[^>]*\bid="([^"]+)"[^>]*>/g)) {
      const el = element(), val = m[0].match(/\bvalue="([^"]*)"/);
      el.id = m[2]; el.disabled = /\sdisabled(?:\s|>)/.test(m[0]);
      if (val) el.value = decode(val[1]);
      if (m[1] === 'textarea') el.value = decode(v.slice(m.index + m[0].length).split('</textarea>')[0]);
      nodes.set(el.id, el);
    }
  } });
  app.addEventListener = (type, cb) => listeners[type] = cb;
  class FakeDate extends Date { constructor(...a) { super(...(a.length ? a : [clock])); } static now() { return clock; } }
  function schedule(fn, delay, interval = false) { const id = ++seq; tasks.set(id, { fn, at: clock + delay, delay, interval }); return id; }
  const ctx = vm.createContext({ console, Date: FakeDate, Math, Blob, localStorage: storage,
    matchMedia: () => ({ matches: false }), isSecureContext: true,
    document: { getElementById: id => id === 'kc-app' ? app : nodes.get(id) || null, createElement: () => element(), body: { appendChild() {} } },
    navigator: { clipboard: { writeText() { return Promise.resolve(); } } }, URL: { createObjectURL() { return 'blob:test'; }, revokeObjectURL() {} },
    FileReader: class {}, setTimeout: (f, d) => schedule(f, d), clearTimeout: id => tasks.delete(id),
    setInterval: (f, d) => schedule(f, d, true), clearInterval: id => tasks.delete(id),
    requestAnimationFrame: f => schedule(() => f(clock), 16), cancelAnimationFrame: id => tasks.delete(id)
  });
  Object.assign(ctx, globals);
  ctx.window = ctx;
  // 始终沿 index.html 的实际加载顺序，包含现有音效和罗盘展示层。
  const scripts = [...fs.readFileSync(path.join(demo, 'index.html'), 'utf8').matchAll(/<script src="([^"]+)"/g)];
  for (const [, file] of scripts) vm.runInContext(fs.readFileSync(path.join(demo, file), 'utf8'), ctx, { filename: file });
  const run = s => vm.runInContext(s, ctx);
  function click(action, data = {}) { const b = element(); b.dataset = { action, ...data }; listeners.click({ target: { closest: () => b } }); }
  function input(id, value) { const el = nodes.get(id); assert.ok(el, 'missing node ' + id); el.value = value; listeners.input({ target: el }); }
  function advance(ms) {
    const until = clock + ms;
    for (let i = 0; i < 10000; i++) {
      const next = [...tasks].filter(([, t]) => t.at <= until).sort((a, b) => a[1].at - b[1].at)[0];
      if (!next) { clock = until; return; }
      const [id, t] = next; clock = t.at;
      if (t.interval) t.at += t.delay; else tasks.delete(id);
      t.fn();
    }
    throw Error('timer loop');
  }
  return { run, click, input, advance, storage, nodes, app,
    get intervals() { return [...tasks.values()].filter(t => t.interval).length; }
  };
}
function challenge(b, step) { b.run(`S.view='challenge';S.ch.locked=Store.filterPool()[0].id;S.ch.step=${step};render()`); }
function review(b) { b.run(`S.view='review';S.consent.review=true;S.rv.segs=MOCK.segs.map(s=>({...s}));S.rv.step=2;render()`); }
function roundTrip(b, view) { b.click('nav', { view: 'settings' }); b.click('nav', { view }); }
module.exports = { boot, challenge, review, roundTrip };
if (require.main === module) {
let count = 0;
function check(name, fn) { fn(); console.log('PASS ' + name); count++; }

check('B01: one malformed record does not hide good users or overwrite raw cache', () => {
  const raw = JSON.stringify({ activeVocabId: '__default__', vocabs: [user, { id: 'bad', terms: {} }] });
  const b = boot(raw);
  assert.equal(b.run(`Store.getVocab('user_keep').terms.length`), 2);
  assert.equal(b.run('S.activeVocabId'), '__bank_prob__');
  assert.equal(b.run('S.vocabStorage.blocked'), true);
  b.run(`Store.setActiveVocab('user_keep');Store.toggleTerm('user_keep','u1');Store.deleteVocab('user_keep')`);
  assert.equal(b.run(`Store.getVocab('user_keep').terms[0].enabled`), true);
  assert.equal(b.storage.data[key], raw); assert.equal(b.storage.writes, 0);
  challenge(b, 0); assert.ok(b.app.innerHTML.includes('原缓存未覆盖'));
});
check('B01: malformed JSON / root shape / invalid term protects original cache', () => {
  for (const raw of ['{', '{"vocabs":{}}', JSON.stringify({ vocabs: [{ ...user, terms: [{ ...user.terms[0], title: 42 }, user.terms[1]] }] })]) {
    const b = boot(raw); assert.equal(b.run('S.vocabStorage.blocked'), true);
    b.run(`Store.setActiveVocab('__bank_c__')`); assert.equal(b.storage.data[key], raw); assert.equal(b.storage.writes, 0);
  }
  const b = boot(rawUser()); b.storage.failRead = true; b.run('ensureVocabsLoaded()');
  assert.equal(b.run('S.vocabStorage.blocked'), true); b.run('persistVocabs()'); assert.equal(b.storage.writes, 0);
});
check('B01: quota failure rolls back CRUD and keeps import preview for retry', () => {
  const b = boot(rawUser()); b.storage.failWrite = true;
  b.run(String.raw`S.vocabImport={fileName:'retry.md',parsed:VocabParser.parseVocabMarkdown('# 新库\n## 入门\n- 新词')};S.view='challenge';render()`);
  b.click('ch:vocab-import'); assert.equal(b.run('S.vocabs.length'), 5); assert.equal(b.run('S.vocabImport.fileName'), 'retry.md');
  assert.ok(b.app.innerHTML.includes('未保存成功')); assert.equal(b.storage.data[key], rawUser());
  assert.equal(b.run(`Store.deleteVocab('user_keep')`), false); assert.equal(b.run('S.activeVocabId'), user.id);
  assert.equal(b.run(`Store.toggleTerm('user_keep','u1')`), false); assert.equal(b.run(`Store.getVocab('user_keep').terms[0].enabled`), true);
  assert.equal(b.run(`Store.setActiveVocab('__bank_c__')`), false); assert.equal(b.run('S.activeVocabId'), user.id);
  b.storage.failWrite = false; b.click('ch:vocab-import');
  assert.equal(b.run('S.vocabs.length'), 6); assert.equal(b.run('S.vocabImport.parsed'), null); assert.equal(b.run('S.vocabStorage.error'), '');
  assert.equal(JSON.parse(b.storage.data[key]).vocabs.length, 2);
});
check('B01: normal legacy data and user ID/disabled flags survive reload', () => {
  const b = boot(JSON.stringify({ activeVocabId: '__default__', vocabs: [{ id: '__default__', builtin: true }, user] }));
  assert.equal(b.run('S.vocabStorage.blocked'), false); assert.equal(b.run('S.activeVocabId'), '__bank_prob__');
  b.run(`Store.setActiveVocab('user_keep')`); const reloaded = boot(b.storage.data[key]);
  assert.equal(reloaded.run('Store.filterPool().length'), 1); assert.equal(reloaded.run(`Store.getVocab('user_keep').terms[1].id`), 'u2');
  assert.equal(reloaded.run('S.vocabs.filter(v=>v.builtin).reduce((n,v)=>n+v.terms.length,0)'), 124);
});
check('B02: explanation/answer/revision drafts survive navigation and skip without overwriting submitted text', () => {
  const b = boot();
  for (const [step, id, field] of [[3,'ch-exp','explanation'],[4,'ch-ans','answer'],[6,'ch-rev','revision']]) {
    challenge(b, step); b.run(`S.ch.qShown=true;render()`);
    const text = '<原文> & "空白"\n'; b.input(id, text); roundTrip(b, 'challenge'); assert.equal(b.nodes.get(id).value, text);
    assert.equal(b.run(`S.ch.draft.${field}`), text);
  }
  challenge(b, 4); b.input('ch-ans', '保留回答'); b.click('ch:skip-q'); b.click('ch:unskip'); assert.equal(b.nodes.get('ch-ans').value, '保留回答');
  challenge(b, 3); b.input('ch-exp', '提交原文'); b.click('ch:submit-exp');
  challenge(b, 3); b.input('ch-exp', '草稿未提交'); assert.equal(b.run('S.ch.explained'), '提交原文');
});
check('B02: script hide/show/navigation/save/export preserves edits, including empty text', () => {
  const b = boot(); challenge(b, 7); b.click('ch:toggle-md');
  const text = '# 我的脚本\n\n<测试> & "引用"'; b.input('script-md', text);
  b.click('ch:toggle-md'); b.click('ch:toggle-md'); roundTrip(b, 'challenge'); assert.equal(b.nodes.get('script-md').value, text);
  b.click('ch:toggle-md'); b.click('ch:save'); assert.equal(b.run('S.works[0].md'), text);
  assert.ok(b.run('buildExportMd(S.works[0])').includes(text));
  challenge(b, 7); b.run('S.ch.showMd=true;render()'); b.input('script-md', ''); b.click('ch:toggle-md'); b.click('ch:toggle-md'); assert.equal(b.nodes.get('script-md').value, '');
  b.click('ch:save'); assert.equal(b.run('S.works[1].md'), '');
});
check('B02: programmatic sample fill and new challenge lifecycle', () => {
  const b = boot(); challenge(b, 3); b.run(`S.ch.locked='__bank_prob__:'+Store.getVocab('__bank_prob__').terms.find(t=>t.richId==='coin').id;render()`);
  for (const [step, act, id] of [[3,'ch:fill-exp','ch-exp'],[4,'ch:fill-ans','ch-ans'],[6,'ch:fill-rev','ch-rev']]) {
    b.run(`S.ch.step=${step};S.ch.qShown=true;render()`); b.click(act); const value = b.nodes.get(id).value;
    assert.ok(value.length); roundTrip(b,'challenge'); assert.equal(b.nodes.get(id).value, value);
  }
  b.click('ch:restart'); assert.equal(b.run('S.ch.draft.explanation'), null); assert.equal(b.run('S.ch.scriptMd'), null);
});
check('B03: confirm is idempotent; snapshots keep original IDs/time/text and cannot mutate', () => {
  const b = boot(); review(b); b.click('rv:confirm'); b.click('rv:confirm');
  assert.equal(b.run('S.rv.transcriptVersions.length'), 1); assert.equal(b.run('S.rv.version'), 1);
  assert.equal(b.run('Object.isFrozen(S.rv.transcriptVersions[0].segs[0])'), true);
  b.input('segin-0', '新数字 100'); b.input('segin-0', '新数字 200');
  assert.equal(b.run('S.rv.version'), 2); assert.equal(b.run('S.rv.confirmed'), 0);
  assert.equal(b.nodes.get('rv-report-btn').disabled, true);
  assert.equal(b.run('S.rv.transcriptVersions[0].segs[0].text'), b.run('MOCK.segs[0].text'));
  roundTrip(b, 'review'); assert.equal(b.nodes.get('segin-0').value, '新数字 200'); b.click('rv:confirm');
  assert.equal(b.run('S.rv.transcriptVersions.length'), 2); assert.equal(b.run('S.rv.confirmed'), 2);
  assert.equal(b.run('S.rv.transcriptVersions[1].segs[0].id'), 'ts1'); assert.equal(b.run('S.rv.transcriptVersions[1].segs[0].end'), 8200);
});
check('B03: edited/cleared/all-empty draft cannot generate or save a current report', () => {
  const b = boot(); review(b); b.click('rv:confirm'); b.click('rv:report'); b.click('rv:edit');
  b.click('rv:clear-seg', { i:'0' }); b.click('rv:clear-seg', { i:'1' }); b.click('rv:confirm');
  assert.equal(b.run('S.rv.confirmed'), 0); assert.equal(b.run('S.rv.transcriptVersions.length'), 1);
  b.click('rv:report'); assert.equal(b.run('S.rv.reportVersions.length'), 1); assert.equal(b.run('S.rv.step'), 2);
  b.click('rv:view-report'); assert.ok(b.app.innerHTML.includes('已过期')); assert.ok(!b.app.innerHTML.includes('data-action="rv:save"'));
  b.click('rv:regen'); assert.equal(b.run('S.rv.reportOn'), 1); assert.equal(b.run('Store.saveReview()'), false);
  assert.equal(b.run('S.rv.segs.every(s=>!s.text)'), true);
});
check('B03: old/new reports remain bound to their own snapshots; new result can be saved', () => {
  const b = boot(); review(b); b.click('rv:confirm'); b.click('rv:report'); b.click('rv:save'); b.click('rv:edit');
  b.input('segin-0', '核对后新稿'); b.click('rv:confirm'); b.click('rv:report');
  assert.equal(b.run('S.rv.saved'), false); assert.equal(b.run('S.rv.reportVersions.length'), 2);
  b.click('rv:save'); assert.equal(b.run('S.works.length'), 2);
  assert.equal(b.run('S.works[0].version'), 1); assert.equal(b.run('S.works[1].version'), 2);
  assert.equal(b.run('S.works[0].segs[0].text'), b.run('MOCK.segs[0].text')); assert.equal(b.run('S.works[1].segs[0].text'), '核对后新稿');
  b.click('rv:history', { v:'1' }); assert.equal(b.run('S.rv.reportOn'), 1); assert.ok(b.app.innerHTML.includes('已过期')); assert.equal(b.run('Store.saveReview()'), false);
  b.click('rv:history', { v:'2' }); assert.equal(b.run('S.rv.reportOn'), 2); assert.equal(b.run('S.rv.confirmed'), 2);
  assert.equal(b.run('S.works[1].transcriptVersions.length'), 2);
});
check('B03: consent and unconfirmed guards also reject direct Store actions', () => {
  const b = boot(); review(b); assert.equal(b.run('Store.generateReview()'), false);
  b.click('rv:confirm'); b.run('S.consent.review=false'); assert.equal(b.run('Store.generateReview()'), false);
  assert.equal(b.run('S.rv.reportVersions.length'), 0); assert.equal(b.run('Store.showReviewReport(999)'), false);
});
check('timer remains single-instance and pauses across navigation after draft changes', () => {
  const b = boot(); challenge(b, 2); b.click('ch:timer-start');
  for (let i=0;i<10;i++) { b.click('ch:timer-start'); b.run('render()'); }
  assert.equal(b.intervals, 1); b.advance(1250); const remaining=b.run('S.ch.learningTimer.remainingMs');
  roundTrip(b,'challenge'); assert.equal(b.intervals, 0); assert.equal(b.run('S.ch.learningTimer.remainingMs'), remaining);
  b.click('ch:timer-start'); b.advance(remaining); assert.equal(b.run('S.ch.learningTimer.state'), 'finished'); assert.equal(b.run('S.ch.step'), 2);
});
console.log(count + ' P0 regression groups passed (Node; browser not exercised).');
}

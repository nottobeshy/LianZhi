// 审计诊断：仅 Node VM + 内存 DOM/时钟/存储替身；OBSERVED 断言记录当日缺陷，不是验收通过。
// 历史资料：只对应 P0 修复前源码；当前回归运行 node demo/tests/test-p0.js，勿用本文件判断整改通过。
// 从项目根目录运行：node docs/audits/check-2026-10-16.cjs
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '../..');
function boot(raw, failWrite = false) {
  let clock = 0, seq = 0;
  const tasks = new Map(), nodes = new Map(), listeners = {}, reads = [], downloads = [];
  const storage = { raw, getItem() { return this.raw || null; }, setItem(k, v) { if (failWrite) throw Error('QuotaExceededError'); this.raw = v; } };
  const element = () => ({ dataset: {}, style: {}, classList: { add() {}, remove() {} }, textContent: '', value: '', isConnected: true, querySelector() { return null; }, addEventListener() {}, setAttribute() {}, select() {}, click() {}, remove() {} });
  const app = element();
  let html = '';
  Object.defineProperty(app, 'innerHTML', { get() { return html; }, set(v) {
    html = v; nodes.clear();
    for (const m of v.matchAll(/<(\w+)\b[^>]*\bid="([^"]+)"[^>]*>/g)) {
      const el = element(), val = m[0].match(/\bvalue="([^"]*)"/);
      if (val) el.value = val[1];
      if (m[1] === 'textarea') el.value = v.slice(m.index + m[0].length).split('</textarea>')[0];
      nodes.set(m[2], el);
    }
  } });
  app.addEventListener = (type, cb) => listeners[type] = cb;
  class FakeDate extends Date { constructor(...a) { super(...(a.length ? a : [clock])); } static now() { return clock; } }
  function schedule(fn, delay, interval = false) { const id = ++seq; tasks.set(id, { fn, at: clock + delay, delay, interval }); return id; }
  const ctx = vm.createContext({ console, Date: FakeDate, Math, Blob, localStorage: storage,
    matchMedia: () => ({ matches: false }), isSecureContext: true,
    document: { getElementById: id => id === 'kc-app' ? app : nodes.get(id) || null, createElement: () => element(), body: { appendChild(el) { if (el.download) downloads.push(el); } } },
    navigator: { clipboard: { writeText(t) { ctx.copied = t; return Promise.resolve(); } } },
    URL: { createObjectURL(b) { ctx.blob = b; return 'blob:audit'; }, revokeObjectURL() {} },
    FileReader: class { readAsText(f) { this.file = f; reads.push(this); } },
    setTimeout: (f, d) => schedule(f, d), clearTimeout: id => tasks.delete(id),
    setInterval: (f, d) => schedule(f, d, true), clearInterval: id => tasks.delete(id)
  });
  ctx.window = ctx;
  for (const file of ['vocab', 'banks', 'mock-data', 'store', 'ui', 'draw', 'views', 'app']) {
    vm.runInContext(fs.readFileSync(path.join(root, 'demo/js/' + file + '.js'), 'utf8'), ctx, { filename: file + '.js' });
  }
  const run = s => vm.runInContext(s, ctx);
  function click(action, data = {}) { const b = element(); b.dataset = { action, ...data }; listeners.click({ target: { closest: () => b } }); }
  function input(id, value) { const el = nodes.get(id); assert.ok(el, 'missing node ' + id); el.id = id; el.value = value; listeners.input({ target: el }); }
  function advance(ms) {
    const until = clock + ms; let loops = 0;
    while (true) {
      const next = [...tasks].filter(([, t]) => t.at <= until).sort((a, b) => a[1].at - b[1].at)[0];
      if (!next) break;
      if (++loops > 10000) throw Error('timer loop');
      const [id, t] = next; clock = t.at;
      if (t.interval) t.at += t.delay; else tasks.delete(id);
      t.fn();
    }
    clock = until;
  }
  return { ctx, run, click, input, advance, nodes, tasks, reads, storage, downloads, app,
    jump(ms) { clock += ms; for (const t of tasks.values()) if (t.at < clock) t.at = clock; },
    get intervals() { return [...tasks.values()].filter(t => t.interval).length; }
  };
}
let count = 0;
function check(name, fn) { fn(); count++; console.log('PASS ' + name); }
check('four banks / levels / 124 terms / UTF-8 / pool-lock / coin', () => {
  const b = boot();
  b.run(`counts = BUILTIN_BANKS.map(bank => {
    const parsed = VocabParser.parseVocabMarkdown(bank.md);
    if (!parsed.ok) throw Error(bank.id);
    Store.setActiveVocab(bank.id); Store.setDifficulty('all');
    if (Store.filterPool().length !== parsed.terms.length) throw Error('pool');
    for (const level of ['入门','基础','进阶']) {
      Store.setDifficulty(level); const pool = Store.filterPool();
      if (pool.length !== VocabParser.countByLevel(parsed)[level]) throw Error('level');
      for (let i=0;i<20;i++) { const w=Store.pickDraw(); S.ch.locked=w.id; if(Store.getChItem().title!==w.title)throw Error('lock'); }
    }
    return parsed.terms.length;
  });`);
  assert.equal(b.run('counts.reduce((a,n)=>a+n,0)'), 124);
  for (const bank of b.run('BUILTIN_BANKS')) assert.equal(b.run(`VocabParser.parseVocabMarkdown(${JSON.stringify(Buffer.from(bank.md, 'utf8').toString('utf8'))}).ok`), true);
  assert.equal(b.run(`S.ch.locked='__bank_prob__:'+Store.getVocab('__bank_prob__').terms.find(t=>t.richId==='coin').id;Store.isRich()`), true);
});
check('normal legacy user retention / disabled flag / user-only persistence', () => {
  const raw = JSON.stringify({ activeVocabId: '__default__', vocabs: [{ id: '__default__', builtin: true, terms: [] }, { id: 'user_keep', name: '保留', builtin: false, terms: [{ id: 'u1', title: '保留词', level: '入门', enabled: false }, { id: 'u2', title: '可用词', level: '基础', enabled: true }] }] });
  const b = boot(raw);
  assert.equal(b.run('S.activeVocabId'), '__bank_prob__');
  assert.equal(b.run(`Store.getVocab('user_keep').terms[0].enabled`), false);
  b.run(`Store.setActiveVocab('user_keep')`);
  assert.equal(JSON.parse(b.storage.raw).vocabs.length, 1);
  assert.equal(b.run('Store.filterPool().length'), 1);
});
check('timer presets / repeat start-render / nav pause-resume / delayed tick / finish / new draw', () => {
  const b = boot(); b.run(`S.view='challenge';S.ch.locked=Store.filterPool()[0].id;S.ch.step=2;render()`);
  for (const m of [3,5,10]) { b.click('ch:timer-preset', { v: String(m) }); assert.equal(b.run('S.ch.learningTimer.remainingMs'), m*60000); }
  b.click('ch:timer-preset', { v:'3' }); b.click('ch:timer-start');
  for (let i=0;i<10;i++) { b.click('ch:timer-start'); b.run('render()'); }
  assert.equal(b.intervals, 1); b.advance(1250); assert.equal(b.run('S.ch.learningTimer.remainingMs'),178750);
  b.click('nav',{view:'settings'}); assert.equal(b.intervals,0); b.advance(10000); b.click('nav',{view:'challenge'});
  assert.equal(b.run('S.ch.learningTimer.remainingMs'),178750); assert.equal(b.run('S.ch.learningTimer.state'),'paused');
  b.click('ch:timer-start'); b.jump(200000); b.advance(250);
  assert.equal(b.run('S.ch.learningTimer.state'),'finished'); assert.equal(b.run('S.ch.step'),2); assert.equal(b.intervals,0);
  b.click('ch:timer-reset'); assert.equal(b.run('S.ch.learningTimer.remainingMs'),180000);
  b.click('ch:timer-start'); b.click('ch:back-config'); b.click('ch:draw');
  assert.equal(b.run('S.ch.learningTimer.state'),'ready'); assert.equal(b.intervals,0);
});
check('copy payload / download blob and filename (browser APIs mocked)', () => {
  const b=boot(); b.run(`S.view='challenge';render()`);
  for (const key of ['prob','c','psy','phil']) {
    b.run(`S.vocabExampleKey=${JSON.stringify(key)}`); b.click('ch:vocab-example-copy');
    assert.equal(b.ctx.copied,b.run('getBankExample(S.vocabExampleKey).md'));
    b.click('ch:vocab-example-download'); assert.equal(b.ctx.blob.type,'text/markdown;charset=utf-8');
    assert.ok(b.downloads.at(-1).download.endsWith('-范例.md'));
  }
});
check('OBSERVED cancel schedules onDone', () => {
  const b=boot(); b.run(`drawDoneCalls=0;const e={textContent:'',style:{},classList:{add(){}}};const stage={querySelector:()=>e,addEventListener(){},removeEventListener(){}};runDrawCeremony({stage,candidates:[{title:'a'},{title:'b'}],winnerIdx:0,onDone:()=>drawDoneCalls++});cancelAllDraws()`);
  b.advance(1);assert.equal(b.run('drawDoneCalls'),1);
});
check('OBSERVED explanation/script edits lost on render', () => {
  const b=boot();b.run(`S.view='challenge';S.ch.locked=Store.filterPool()[0].id;S.ch.step=3;render()`);
  b.input('ch-exp','未提交解释');b.click('nav',{view:'settings'});b.click('nav',{view:'challenge'});assert.equal(b.nodes.get('ch-exp').value,'');
  b.run(`S.ch.step=7;S.ch.showMd=true;render()`);b.input('script-md','独有脚本内容');b.click('ch:toggle-md');b.click('ch:toggle-md');assert.ok(!b.nodes.get('script-md').value.includes('独有脚本内容'));
});
check('OBSERVED edited transcript still confirmed; reconfirm overwrites; saved blocks resave', () => {
  const b=boot();b.run(`S.view='review';S.consent.review=true;S.rv.segs=MOCK.segs.map(s=>({...s}));S.rv.step=2;render()`);
  b.click('rv:confirm');b.click('rv:report');b.click('rv:save');b.click('rv:edit');b.input('segin-0','全新转写');
  assert.equal(b.run('S.rv.confirmed===S.rv.reportOn'),true);b.click('rv:report');assert.equal(b.run('S.rv.segs[0].text'),'至少一个正面的概率是二分之一。');
  b.click('rv:edit');b.input('segin-0','已确认新稿');b.click('rv:confirm');assert.equal(b.run('S.rv.version'),2);assert.equal(b.run('S.rv.reportOn'),1);
  b.click('rv:report');assert.equal(b.run('S.rv.saved'),true);assert.equal(b.run('S.works.length'),1);assert.equal(b.run('S.works[0].version'),1);assert.ok(!b.app.innerHTML.includes('data-action="rv:save"'));
});
check('OBSERVED 6001-char explanation accepted', () => {
  const b=boot();b.run(`S.view='challenge';S.ch.locked=Store.filterPool()[0].id;S.ch.step=3;render()`);
  b.input('ch-exp','字'.repeat(6001));b.click('ch:submit-exp');assert.equal(b.run('S.ch.explained.length'),6001);assert.equal(b.run('S.ch.step'),4);
});
check('OBSERVED failed storage import reports success; malformed record can drop all users on next write', () => {
  const b=boot(null,true);assert.equal(b.run(String.raw`Store.importVocab(VocabParser.parseVocabMarkdown('# X\n## 入门\n- y'))`),true);assert.equal(b.storage.raw,null);
  const raw=JSON.stringify({activeVocabId:'good',vocabs:[{id:'good',name:'valid',terms:[{id:'a',title:'好词',level:'入门',enabled:true}]},{id:'bad',terms:{}}]});
  const c=boot(raw);assert.equal(c.run(`Store.getVocab('good')`),null);assert.equal(c.storage.raw,raw);c.run(`Store.setActiveVocab('__bank_c__')`);assert.equal(JSON.parse(c.storage.raw).vocabs.length,0);
});
check('OBSERVED same-title cross-vocab association; challenge has no termId', () => {
  const b=boot();b.run(`S.works=[{id:'a',type:'challenge',kp:'同名',vocabId:'bank_a',title:'A'},{id:'b',type:'review',kp:'同名',vocabId:'bank_b',title:'B',segs:[],version:1,reportOn:1}];S.wkSel=1;S.wkLinkPanel=true`);
  assert.ok(b.run('vWorks()').includes('data-action="wk:link" data-id="a"'));
  b.run(`S.ch.locked=Store.filterPool()[0].id;S.ch.explained='解释';S.ch.rev='修正';Store.saveChallenge()`);assert.equal(b.run(`Object.hasOwn(S.works[2],'termId')`),false);
});
check('OBSERVED insertion changes builtin topic ID (integration risk)', () => {
  const b=boot();assert.equal(b.run(String.raw`VocabParser.parseVocabMarkdown('# A\n## 入门\n- 原词').terms[0].id===VocabParser.parseVocabMarkdown('# A\n## 入门\n- 新词\n- 原词').terms[1].id`),false);
});
check('OBSERVED homepage recent click does not navigate', () => {
  const b=boot();b.run(`S.works=[{id:'a',type:'challenge',title:'A',kp:'A',domain:'概率论',status:'x'}];render()`);b.click('wk:open',{i:'0'});assert.equal(b.run('S.view'),'home');assert.equal(b.run('S.wkSel'),0);
});
check('OBSERVED out-of-order file read replaces newer selection', () => {
  const b=boot();b.run(`S.view='challenge';render()`);const fi=b.nodes.get('vocab-file');fi.files=[{name:'old.md'}];fi.addEventListener=(t,cb)=>fi.change=cb;b.run('bindFileInputs()');fi.change();fi.files=[{name:'new.md'}];fi.change();
  b.reads[1].result='# 新\n## 入门\n- 新词';b.reads[1].onload();b.reads[0].result='# 旧\n## 入门\n- 旧词';b.reads[0].onload();assert.equal(b.run('S.vocabImport.fileName'),'old.md');
});
// 校验真正交给下载 API 的 Blob 字节，再送回实际解析器与导入动作；仍不代替浏览器下载/文件选择。
(async () => {
  const b = boot();
  for (const key of ['prob', 'c', 'psy', 'phil']) {
    b.run(`S.vocabExampleKey=${JSON.stringify(key)}`);
    b.click('ch:vocab-example-download');
    const text = Buffer.from(await b.ctx.blob.arrayBuffer()).toString('utf8');
    assert.equal(text, b.run('getBankExample(S.vocabExampleKey).md'));
    assert.notEqual(text.charCodeAt(0), 0xfeff);
    assert.equal(b.run(`Store.importVocab(VocabParser.parseVocabMarkdown(${JSON.stringify(text)}))`), true);
  }
  assert.equal(b.run('S.vocabs.filter(v=>!v.builtin).length'), 4);
  assert.equal(b.run('S.vocabs.filter(v=>v.builtin).length'), 4);
  console.log('PASS download Blob bytes UTF-8 / parser / Store import / builtin retention');
  console.log((count + 1) + ' isolated diagnostic groups completed; OBSERVED confirms issues, not acceptance.');
})().catch(e => { console.error(e); process.exitCode = 1; });
